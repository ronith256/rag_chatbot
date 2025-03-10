import random
import logging

class FeedbackSimulator:
    def __init__(self, custom_rules=None):
        """
        Initialize the FeedbackSimulator with optional custom rules.
        
        Args:
            custom_rules (dict): Custom rules for feedback generation {keyword: feedback}
        """
        # Default feedback options
        self.feedback_options = ["not helpful", "too vague", "good"]
        
        # Feedback weights - "good" has higher chance by default
        self.feedback_weights = [0.25, 0.25, 0.5]
        
        # Custom rules for more realistic feedback
        self.custom_rules = custom_rules or {}
        
    def get_feedback(self, query, response, similarity_score=None):
        """
        Generate simulated feedback based on the query and response
        
        Args:
            query (str): The user query
            response (str): The bot's response
            similarity_score (float, optional): The similarity score from retrieval
            
        Returns:
            str: The feedback ("not helpful", "too vague", or "good")
        """
        # Apply custom rules if available
        if self.custom_rules:
            for rule, feedback in self.custom_rules.items():
                if rule in query.lower() or rule in response.lower():
                    logging.info(f"Applied custom feedback rule for '{rule}': {feedback}")
                    return feedback
        
        # Consider similarity score for more realistic feedback
        if similarity_score is not None:
            if similarity_score < 0.2:
                # Low similarity - more likely to be "not helpful"
                weights = [0.6, 0.3, 0.1]
            elif similarity_score > 0.8:
                # High similarity - more likely to be "good"
                weights = [0.1, 0.2, 0.7]
            else:
                # Medium similarity - balanced weights
                weights = self.feedback_weights
        else:
            weights = self.feedback_weights
            
        feedback = random.choices(self.feedback_options, weights=weights, k=1)[0]
        logging.info(f"Generated feedback: {feedback}")
        return feedback
        
    def add_custom_rule(self, keyword, feedback):
        """
        Add a custom rule for feedback generation
        
        Args:
            keyword (str): The keyword to match in query or response
            feedback (str): The feedback to return
        """
        self.custom_rules[keyword.lower()] = feedback
        logging.info(f"Added custom feedback rule for '{keyword}': {feedback}")