import logging
import argparse
import os
import json

from support_bot_agent import SupportBotAgent

def setup_logging(log_file='support_bot_log.txt'):
    """
    Set up logging configuration
    
    Args:
        log_file (str): Path to the log file
    """
    logging.basicConfig(
        filename=log_file,
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Also log to console
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(levelname)s - %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)

def create_sample_faq():
    """
    Create a sample FAQ file if none is provided
    
    Returns:
        str: Path to the created sample FAQ file
    """
    faq_content = """
Resetting Your Password
To reset your password, go to the login page and click "Forgot Password."
Enter your email and follow the link sent to you.

Refund Policy
We offer refunds within 30 days of purchase. Contact support at
support@example.com with your order number to start the process.

Contacting Support
Email us at support@example.com or call 1-800-555-1234 during business
hours (9 AM - 5 PM EST).

Account Management
You can update your account details in the Profile section after logging in.
This includes your name, email address, and notification preferences.

Shipping Information
Standard shipping takes 3-5 business days. Express shipping is available
for an additional fee and delivers within 1-2 business days. International
shipping may take 7-14 business days depending on the destination country.

Product Returns
To return a product, log into your account, go to Order History, and select
the "Return" option next to the relevant order. You'll need to print a return
label and drop the package at any postal service location.

Subscription Cancellation
To cancel your subscription, go to the Subscriptions section in your account
and click "Cancel Subscription." Cancellations take effect at the end of the
current billing cycle.
"""
    with open('sample_faq.txt', 'w', encoding='utf-8') as f:
        f.write(faq_content)
    return 'sample_faq.txt'

def main():
    """Main function to run the support bot"""
    parser = argparse.ArgumentParser(description='Run the Customer Support Bot Agent')
    parser.add_argument('--document', type=str, help='Path to the document file (PDF or TXT)')
    parser.add_argument('--log', type=str, default='support_bot_log.txt', help='Path to the log file')
    
    args = parser.parse_args()
    
    # Set up logging
    setup_logging(args.log)
    logging.info("Starting Customer Support Bot")
    
    # Use provided document or create a sample
    document_path = args.document
    if not document_path or not os.path.exists(document_path):
        logging.info("No valid document provided, creating a sample FAQ")
        document_path = create_sample_faq()
    
    # Create and initialize the support bot agent
    try:
        support_bot = SupportBotAgent(document_path)
        logging.info(f"Support bot initialized with document: {document_path}")
        
        # Sample queries for testing
        sample_queries = [
            "How do I reset my password?",
            "What's the refund policy?",
            "How do I update my account information?",
            "How long does shipping take?",
            "How do I fly to the moon?"  # Out-of-scope query
        ]
        
        # Run the bot with the sample queries
        logging.info("Running support bot with sample queries")
        results = support_bot.run(sample_queries)
        
        # Save results to a JSON file for analysis
        with open('query_results.json', 'w') as f:
            json.dump(results, f, indent=2)
            
        logging.info("Support bot execution completed successfully")
        
    except Exception as e:
        logging.error(f"Error during support bot execution: {str(e)}")
        raise

if __name__ == "__main__":
    main()