import logging
from transformers import pipeline
from sentence_transformers import util
import torch

class ResponseGenerator:
    def __init__(self, qa_model_name="distilbert-base-uncased-distilled-squad"):
        """
        Initialize the ResponseGenerator with a question-answering model.
        
        Args:
            qa_model_name (str): Name of the transformer model to use for QA
        """
        self.qa_model = pipeline("question-answering", model=qa_model_name)
        
    def find_relevant_section(self, query, document_processor):
        """
        Find the most relevant section for a query using semantic search
        
        Args:
            query (str): The user query
            document_processor (DocumentProcessor): The document processor instance
            
        Returns:
            tuple: (best_section, relevant_sections, similarity_score)
        """
        if not document_processor.sections or document_processor.section_embeddings is None:
            logging.warning("No sections or embeddings available")
            return None, [], 0.0
            
        try:
            query_embedding = document_processor.embedder.encode(query, convert_to_tensor=True)
            similarities = util.cos_sim(query_embedding, document_processor.section_embeddings)[0]
            
            # Get top 2 relevant sections for more context
            top_indices = torch.topk(similarities, min(2, len(similarities))).indices.tolist()
            relevant_sections = [document_processor.sections[idx] for idx in top_indices]
            
            best_idx = similarities.argmax().item()
            best_section = document_processor.sections[best_idx]
            
            similarity_score = similarities[best_idx].item()
            logging.info(f"Found relevant section with similarity score: {similarity_score:.4f}")
            
            # If similarity is too low, it might not be relevant
            if similarity_score < 0.3:
                logging.info("Low relevance score - might not have relevant information")
                
            return best_section, relevant_sections, similarity_score
        except Exception as e:
            logging.error(f"Error finding relevant section: {str(e)}")
            raise
            
    def generate_response(self, query, context):
        """
        Generate a response using the QA model
        
        Args:
            query (str): The user query
            context (str): The context to use for answering
            
        Returns:
            str: The generated response
        """
        if not context:
            return "I don't have enough information to answer that question."
            
        try:
            result = self.qa_model(question=query, context=context)
            confidence = result.get("score", 0)
            
            if confidence < 0.1:
                return "I'm not confident in my answer. It seems your question might not be covered in my knowledge base."
                
            answer = result.get("answer", "")
            logging.info(f"Generated response with confidence: {confidence:.4f}")
            
            return answer
        except Exception as e:
            logging.error(f"Error generating response: {str(e)}")
            return "I encountered an error while trying to answer your question."
            
    def refine_response(self, query, response, feedback, document_processor):
        """
        Refine a response based on feedback
        
        Args:
            query (str): The user query
            response (str): The current response
            feedback (str): The feedback ("too vague", "not helpful", "good")
            document_processor (DocumentProcessor): The document processor instance
            
        Returns:
            str: The refined response
        """
        if feedback == "too vague":
            # Provide more context by combining multiple relevant sections
            _, relevant_sections, _ = self.find_relevant_section(query, document_processor)
            combined_context = " ".join(relevant_sections)
            new_response = self.generate_response(query, combined_context)
            
            # If the new response is too similar to the original, add explicit additional info
            if new_response == response:
                return f"{response} (Additional information: {combined_context[:150]}...)"
            return new_response
            
        elif feedback == "not helpful":
            # Try rephrasing the query to get a different perspective
            rephrased_queries = [
                f"Please explain {query}",
                f"What information do you have about {query}?",
                f"Tell me about {query} in simple terms"
            ]
            
            for rephrased_query in rephrased_queries:
                best_section, _, _ = self.find_relevant_section(rephrased_query, document_processor)
                new_response = self.generate_response(rephrased_query, best_section)
                
                # If we got a different response, use it
                if new_response != response:
                    return new_response
                    
            # If all rephrased queries yield the same response, enrich with context
            return f"Let me clarify: {response}"
            
        return response  # If feedback is "good" or unrecognized, return the original response