import logging
import time
from document_processor import DocumentProcessor
from response_generator import ResponseGenerator
from feedback_simulator import FeedbackSimulator

class SupportBotAgent:
    def __init__(self, document_path, embedding_model='all-MiniLM-L6-v2', qa_model_name="distilbert-base-uncased-distilled-squad"):
        """
        Initialize the SupportBotAgent with a document and models.
        
        Args:
            document_path (str): Path to the document file
            embedding_model (str): Name of the embedding model
            qa_model_name (str): Name of the QA model
        """
        self.document_processor = DocumentProcessor(embedding_model)
        self.response_generator = ResponseGenerator(qa_model_name)
        self.feedback_simulator = FeedbackSimulator()
        
        # Add custom feedback rules for more realistic simulation
        self.feedback_simulator.add_custom_rule("password", "good")
        self.feedback_simulator.add_custom_rule("refund", "too vague")
        self.feedback_simulator.add_custom_rule("contact", "good")
        
        # Load and process the document
        self._initialize_document(document_path)
        
    def _initialize_document(self, document_path):
        """
        Initialize the document processing pipeline
        
        Args:
            document_path (str): Path to the document file
        """
        start_time = time.time()
        logging.info(f"Initializing document: {document_path}")
        
        try:
            # Load the document
            self.document_processor.load_document(document_path)
            
            # Split into sections
            self.document_processor.split_into_sections()
            
            # Compute embeddings
            self.document_processor.compute_embeddings()
            
            elapsed_time = time.time() - start_time
            logging.info(f"Document initialization completed in {elapsed_time:.2f} seconds")
        except Exception as e:
            logging.error(f"Error during document initialization: {str(e)}")
            raise
            
    def answer_query(self, query):
        """
        Answer a customer query based on the document
        
        Args:
            query (str): The customer query
            
        Returns:
            tuple: (response, similarity_score)
        """
        logging.info(f"Processing query: '{query}'")
        
        try:
            # Find relevant section
            best_section, _, similarity_score = self.response_generator.find_relevant_section(
                query, self.document_processor
            )
            
            # Check if we found anything relevant
            if not best_section or similarity_score < 0.1:
                response = "I don't have enough information to answer that question. Would you like me to connect you with a human agent?"
                logging.info("Query seems out of scope - no relevant section found")
            else:
                # Generate initial response
                response = self.response_generator.generate_response(query, best_section)
                
            return response, similarity_score
        except Exception as e:
            logging.error(f"Error answering query: {str(e)}")
            return "I'm sorry, I encountered an error while processing your question.", 0.0
            
    def process_query_with_feedback(self, query, max_iterations=2):
        """
        Process a query with feedback-based refinement
        
        Args:
            query (str): The customer query
            max_iterations (int): Maximum number of refinement iterations
            
        Returns:
            dict: Result containing query, responses, and feedback history
        """
        logging.info(f"Starting query processing with feedback: '{query}'")
        
        # Get initial response
        response, similarity_score = self.answer_query(query)
        initial_response = response
        
        print(f"\nQuery: {query}")
        print(f"Initial Response: {response}")
        
        # Initialize feedback loop
        iteration = 0
        feedback_history = []
        
        # Feedback refinement loop
        while iteration < max_iterations:
            # Get feedback
            feedback = self.feedback_simulator.get_feedback(query, response, similarity_score)
            feedback_history.append(feedback)
            
            print(f"Feedback: {feedback}")
            
            # If feedback is good, we're done
            if feedback == "good":
                logging.info(f"Received 'good' feedback - ending refinement loop")
                break
                
            # Refine the response based on feedback
            refined_response = self.response_generator.refine_response(
                query, response, feedback, self.document_processor
            )
            
            # Update the response
            response = refined_response
            print(f"Refined Response: {response}")
            
            # Increment iteration counter
            iteration += 1
            
        # Log feedback history and final response
        logging.info(f"Feedback history: {feedback_history}")
        logging.info(f"Initial response: '{initial_response}'")
        logging.info(f"Final response after {iteration} refinements: '{response}'")
        
        return {
            "query": query,
            "initial_response": initial_response,
            "final_response": response,
            "feedback_history": feedback_history,
            "iterations": iteration
        }
        
    def run(self, queries):
        """
        Run the support bot on a list of queries
        
        Args:
            queries (list): List of customer queries
            
        Returns:
            list: Results for each query
        """
        results = []
        for query in queries:
            result = self.process_query_with_feedback(query)
            results.append(result)
            print("\n" + "-"*50 + "\n")
            
        return results