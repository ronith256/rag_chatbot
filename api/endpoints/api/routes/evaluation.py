from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile
from fastapi.responses import StreamingResponse
from datetime import datetime
import time
import asyncio
import json
import uuid
import numpy as np
from motor.motor_asyncio import AsyncIOMotorDatabase
from core.models import ChatRequest, RAGConfig, LLMConfig
from services.rag_service import RAGService
from services.llm_service import LLMService
from services.embeddings_service import EmbeddingsService
from ..dependencies import get_db, get_llm_service, get_embeddings_service, get_rag_service
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from config.settings import settings 
import os

class UserResponse(BaseModel):
    response: str = Field(description="The user's response message")
    done: bool = Field(description="Whether the conversation should end")
    reason: str = Field(description="Reason for ending the conversation if done is True")

class InteractionScore(BaseModel):
    score: int = Field(description="Score from 0-10 rating the interaction quality")
    feedback: str = Field(description="Detailed feedback about the interaction")
    success: bool = Field(description="Whether the interaction was successful")
    reason: str = Field(description="Reason for success or failure")

class ConversationConfig(BaseModel):
    initial_message: str = Field(default="Hi")
    max_depth: int = Field(default=5)
    user_system_prompt: Optional[str] = None

class Message(BaseModel):
    role: str
    content: str

router = APIRouter()

def cosine_similarity(embedding1, embedding2):
    return np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))

def create_evaluation_llm():
    api_type, base_url, api_key = settings.get_models_config()
    get_llm_service()._get_llm_advanced(LLMConfig(model='Meta-Llama-3.1-70B-Instruct', base_url=base_url, api_key=os.env[api_key], api_type=api_type))

async def get_bot_response(message: str, chat_history: List[Dict[str, str]], agent_id: str, uid: str):
    try:
        request = ChatRequest(messages=[
            Message(role=msg["role"], content=msg["content"]) 
            for msg in chat_history
        ] + [Message(role="user", content=message)])
        
        agent = await get_db().agents.find_one({"id": agent_id})
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Initialize services with agent configuration
        rag_config = RAGConfig(**agent["config"])
        embeddings_service = get_embeddings_service(rag_config.advancedEmbeddingsConfig)
        rag_service = get_rag_service(get_llm_service(), embeddings_service)
        rag_chain = rag_service.get_chain(rag_config)

        chat_history_messages = [
            HumanMessage(content=msg["content"]) if msg["role"] == "user"
            else AIMessage(content=msg["content"])
            for msg in chat_history
        ]

        # Generate response using RAG chain
        response = await rag_chain.ainvoke({
            "input": message,
            "chat_history": chat_history_messages
        })

        # Store the conversation in the database
        ai_message = {"role": "assistant", "content": response["answer"]}
        updated_history = chat_history + [{"role": "user", "content": message}, ai_message]
        
        await get_db().chats.update_one(
            {"uid": uid},
            {
                "$set": {
                    "uid": uid,
                    "agent_id": agent_id,
                    "messages": updated_history,
                    "last_updated": datetime.utcnow()
                }
            },
            upsert=True
        )

        return response["answer"]
        
    except Exception as e:
        print(f"Error getting bot response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting bot response: {str(e)}")

async def get_user_response(messages: List[Dict[str, str]], max_depth: int, current_depth: int, system_prompt: Optional[str] = None) -> UserResponse:
    try:
        formatted_messages = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Bot'}: {msg['content']}" 
            for msg in messages 
            if msg['role'] != 'system'
        ])
        
        default_system_prompt = """You run an online EdTech coaching program for helping students prepare for competitive coding exams. 
        You're based in Bangalore but want to scale your business nationally. You've been struggling with lead generation, 
        automating follow-ups, and converting leads to paying students. You are particularly concerned about the high drop-off 
        rate during your current manual follow-up process.
        
        You're evaluating marketing automation solutions and are now interacting with Zen, the chatbot from Serri AI. 
        Serri claims to be an AI-powered growth engine for B2C businesses that can help with WhatsApp marketing automation, 
        lead qualification, and sales conversion. You're interested but also skeptical about implementation complexity and ROI."""
        
        system_template = (system_prompt or default_system_prompt) + """

        IMPORTANT CONSTRAINTS:
        - The conversation can only have {max_depth} back-and-forth interactions
        - You are currently on interaction {current_depth}
        - You must be convinced about using Serri's services within these interactions
        - If you're not convinced or don't like the responses, set done to true with an appropriate reason
        - If you reach max depth without being convinced, set done to true with reason "max_depth_reached"
        - Your response should only be to the messages sent by the bot
        - If you're convinced to try Serri with these interactions, set done to true with the appropriate reason
        
        As an EdTech business owner, you should:
        - Ask specific questions about how Serri can help with student acquisition and retention
        - Show concerns about implementation complexity (you have a small tech team)
        - Question the cost-effectiveness for an education business
        - Ask about specific EdTech success stories
        - Be persuaded by concrete examples and metrics specific to education business

        Previous conversation:
        {messages}

        Respond as a genuine EdTech business owner evaluating the service."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_template),
            ("human", "Based on the conversation so far, what would you say next?")
        ])

        llm = create_evaluation_llm()
        structured_llm = llm.with_structured_output(UserResponse)
        chain = prompt | structured_llm

        result = chain.invoke({
            "max_depth": max_depth,
            "current_depth": current_depth,
            "messages": formatted_messages
        })
        
        return result
    except Exception as e:
        print(f"Error in get_user_response: {str(e)}")
        return UserResponse(
            response="I apologize, but I'm having trouble continuing the conversation.",
            done=True,
            reason=f"error: {str(e)}"
        )

async def get_interaction_score(history: List[Dict[str, str]], max_depth: int) -> InteractionScore:
    system_template = """You're evaluating an interaction between a user and a sales bot. The bot had {max_depth} interactions 
    to convince the user to use their service.

    Evaluate the conversation based on:
    1. Quality of bot responses
    2. Understanding of user needs
    3. Effectiveness of sales approach
    4. Whether the goal was achieved within the interaction limit

    Conversation history:
    {messages}

    Provide:
    1. A score from 0-10
    2. Detailed feedback
    3. Whether the interaction was successful (user was convinced)
    4. Reason for success/failure
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        ("human", "Please evaluate this conversation.")
    ])

    llm = create_evaluation_llm()
    structured_llm = llm.with_structured_output(InteractionScore)
    chain = prompt | structured_llm

    formatted_messages = "\n".join([
        f"{'User' if msg['role'] == 'user' else 'Bot'}: {msg['content']}"
        for msg in history
        if msg['role'] != 'system'
    ])

    result = chain.invoke({
        "max_depth": max_depth,
        "messages": formatted_messages
    })

    return result

@router.post("/{agent_id}/evaluate_conversation")
async def evaluate_conversation(
    agent_id: str,
    conversation_config: ConversationConfig,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
    llm_service: LLMService = Depends(get_llm_service),
):
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    job_id = str(uuid.uuid4())
    chat_id = str(uuid.uuid4())
    
    # Initialize job status
    await db.evaluation_jobs.insert_one({
        "_id": job_id,
        "agent_id": agent_id,
        "status": "processing",
        "type": "conversation",
        "created_at": datetime.utcnow()
    })

    async def process_conversation(
        agent_id: str,
        conversation_config: ConversationConfig,
        job_id: str,
        chat_id: str,
        db: AsyncIOMotorDatabase
    ):
        try:
            messages = []
            current_depth = 0
            
            # Add initial message
            initial_message = {"role": "user", "content": conversation_config.initial_message}
            messages.append(initial_message)
            
            # Get initial bot response
            bot_response = await get_bot_response(
                conversation_config.initial_message,
                messages,
                agent_id,
                chat_id
            )
            messages.append({"role": "assistant", "content": bot_response})
            
            # Continue conversation until max_depth or early termination
            while current_depth < conversation_config.max_depth:
                current_depth += 1
                
                # Get user response
                user_result = await get_user_response(
                    messages,
                    conversation_config.max_depth,
                    current_depth,
                    conversation_config.user_system_prompt
                )
                
                messages.append({"role": "user", "content": user_result.response})
                
                # Check if conversation should end
                if user_result.done:
                    break
                
                # Get bot response
                bot_response = await get_bot_response(
                    user_result.response,
                    messages,
                    agent_id,
                    chat_id
                )
                messages.append({"role": "assistant", "content": bot_response})
            
            # Get final score
            score_result = await get_interaction_score(messages, conversation_config.max_depth)
            
            # Store evaluation results
            evaluation_result = {
                "agent_id": agent_id,
                "job_id": job_id,
                "timestamp": datetime.utcnow(),
                "type": "conversation",
                "status": "completed",
                "max_depth": conversation_config.max_depth,
                "final_depth": current_depth,
                "conversation": messages,
                "score": score_result.score,
                "success": score_result.success,
                "feedback": score_result.feedback,
                "reason": score_result.reason
            }
            
            await db.evaluations.insert_one(evaluation_result)
            
            # Update job status
            await db.evaluation_jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "completion_time": datetime.utcnow()
                    }
                }
            )

        except Exception as e:
            print(f"Error in conversation evaluation: {str(e)}")
            # Update job status to failed
            await db.evaluation_jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "failed",
                        "error": str(e),
                        "completion_time": datetime.utcnow()
                    }
                }
            )
            
            # Store failed evaluation
            await db.evaluations.insert_one({
                "agent_id": agent_id,
                "job_id": job_id,
                "timestamp": datetime.utcnow(),
                "type": "conversation",
                "status": "failed",
                "error": str(e)
            })

    # Start processing in background
    background_tasks.add_task(process_conversation)
    return {"job_id": job_id}  

@router.post("/{agent_id}/evaluate")
async def evaluate(
    agent_id: str,
    evaluation_set: UploadFile,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
    llm_service: LLMService = Depends(get_llm_service)
):
    agent = await db.agents.find_one({"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Read and validate evaluation set
    try:
        content = await evaluation_set.read()
        eval_data = json.loads(content)
        if not isinstance(eval_data, list) or not all(isinstance(item, dict) and "question" in item and "answer" in item for item in eval_data):
            raise ValueError("Invalid evaluation set format")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    job_id = str(uuid.uuid4())
    await db.evaluation_jobs.insert_one({
        "_id": job_id,
        "agent_id": agent_id,
        "status": "processing",
        "progress": 0.0,
        "total_questions": len(eval_data),
        "processed_questions": 0,
        "created_at": datetime.utcnow()
    })

    async def process_evaluation():
        try:
            # Initialize services
            rag_config = RAGConfig(**agent["config"])
            embeddings_service = get_embeddings_service(rag_config.advancedEmbeddingsConfig)
            rag_service = get_rag_service(llm_service, embeddings_service)
            rag_chain = rag_service.get_rag_chain(rag_config)
            embeddings = embeddings_service.get_embeddings()

            evaluation_results = []
            total_questions = len(eval_data)

            for idx, qa_pair in enumerate(eval_data):
                try:
                    # Generate RAG response
                    response = await rag_chain.ainvoke({
                        "input": qa_pair["question"],
                        "chat_history": []
                    })
                    generated_answer = response.get("answer", "")

                    # Generate embeddings for both answers
                    original_embedding = embeddings.embed_query(qa_pair["answer"])
                    generated_embedding = embeddings.embed_query(generated_answer)

                    # Calculate similarity score
                    similarity_score = cosine_similarity(original_embedding, generated_embedding)

                    # Store result
                    result = {
                        "question": qa_pair["question"],
                        "original_answer": qa_pair["answer"],
                        "generated_answer": generated_answer,
                        "similarity_score": float(similarity_score)  # Convert numpy float to Python float
                    }
                    evaluation_results.append(result)

                    # Update progress
                    await db.evaluation_jobs.update_one(
                        {"_id": job_id},
                        {
                            "$inc": {"processed_questions": 1},
                            "$set": {"progress": (idx + 1) / total_questions}
                        }
                    )

                except Exception as e:
                    # Log error but continue with other questions
                    print(f"Error processing question {idx + 1}: {str(e)}")
                    await db.evaluation_jobs.update_one(
                        {"_id": job_id},
                        {"$push": {"errors": f"Error on question {idx + 1}: {str(e)}"}}
                    )

            # Calculate aggregate metrics
            similarity_scores = [result["similarity_score"] for result in evaluation_results]
            aggregate_metrics = {
                "mean_similarity": float(np.mean(similarity_scores)),
                "median_similarity": float(np.median(similarity_scores)),
                "min_similarity": float(np.min(similarity_scores)),
                "max_similarity": float(np.max(similarity_scores)),
                "std_similarity": float(np.std(similarity_scores))
            }

            # Store final results
            await db.evaluations.insert_one({
                "agent_id": agent_id,
                "job_id": job_id,
                "timestamp": datetime.utcnow(),
                "results": evaluation_results,
                "aggregate_metrics": aggregate_metrics,
                "status": "completed"
            })

            # Update job status to completed
            await db.evaluation_jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "progress": 1.0,
                        "completion_time": datetime.utcnow()
                    }
                }
            )

        except Exception as e:
            # Update job status to failed
            await db.evaluation_jobs.update_one(
                {"_id": job_id},
                {
                    "$set": {
                        "status": "failed",
                        "error": str(e),
                        "completion_time": datetime.utcnow()
                    }
                }
            )

            await db.evaluations.insert_one({
                "agent_id": agent_id,
                "job_id": job_id,
                "timestamp": datetime.utcnow(),
                "results": evaluation_results,
                "aggregate_metrics": aggregate_metrics,
                "status": "failed",
                "error": str(e)
            })

    # Start processing in background
    background_tasks.add_task(process_evaluation)
    return {"job_id": job_id}

@router.get("/evaluation-jobs/{job_id}")
async def get_evaluation_status(
    job_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    job = await db.evaluation_jobs.find_one({"_id": job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Evaluation job not found")
    return job

@router.get("/{agent_id}/evaluations")
async def get_agent_evaluations(
    agent_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    evaluations = await db.evaluations.find({"agent_id": agent_id}, {'_id': False}).sort("timestamp", -1).to_list(None)
    if not evaluations:
        return []
    return evaluations