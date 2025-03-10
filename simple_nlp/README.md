# Customer Support Bot with Document Training

This is a simple chatbot workflow in Python that trains on a provided document (e.g., a PDF or text file), answers customer support queries based on that document, and refines its responses using simulated feedback.

## Features

- Document processing for both PDF and text files
- Semantic search using sentence embeddings
- Question answering with transformer models
- Feedback-based response refinement
- Detailed logging of actions and decisions
- Graceful handling of out-of-scope queries

## Setup

### Requirements

- Python 3.7+
- PyPDF2
- transformers
- sentence-transformers
- torch

## Usage

### Basic Usage

Run the support bot with a document:

```
python main.py --document path/to/your/document.pdf
```

If no document is provided, a sample FAQ will be created automatically.

### Advanced Usage

You can customize the behavior of the support bot by modifying the parameters in `support_bot_agent.py`.

### Output

The bot will:
- Print the queries and responses to the console
- Generate a detailed log file (`support_bot_log.txt` by default)
- Save query results to `query_results.json`

## Code Structure

- `main.py` - Driver script to run the bot
- `support_bot_agent.py` - Main agent class implementing the core logic
- `document_processor.py` - Document loading and preprocessing
- `response_generator.py` - Response generation and refinement
- `feedback_simulator.py` - Simulated feedback generation
- `requirements.txt` - List of dependencies

## Example

```python
from support_bot_agent import SupportBotAgent

# Initialize the support bot with a document
bot = SupportBotAgent("faq.pdf")

# Process a single query with feedback
result = bot.process_query_with_feedback("How do I reset my password?")

# Run the bot with multiple queries
queries = [
    "How do I reset my password?",
    "What's the refund policy?",
    "How do I update my account information?"
]
results = bot.run(queries)
```

## Workflow

1. **Document Training**:
   - The bot loads and processes the provided document
   - It splits the document into semantic sections
   - It creates embeddings for each section to enable semantic search

2. **Query Handling**:
   - The bot accepts a customer query
   - It finds the most relevant section using semantic search
   - It generates a response using a pre-trained question-answering model

3. **Feedback Loop**:
   - The bot simulates user feedback (e.g., "too vague", "not helpful")
   - It refines its response based on the feedback
   - It can go through multiple iterations of refinement

4. **Logging and Transparency**:
   - All actions and decisions are logged to a file
   - Results of query processing are saved for analysis

## Development Decisions

- **Modular Design**: The code is split into multiple modules for better maintainability
- **Error Handling**: Comprehensive error handling throughout the codebase
- **Semantic Search**: Used sentence transformers for better relevance matching
- **Context Awareness**: The bot considers multiple relevant sections when refining responses
- **Graceful Fallbacks**: Proper handling of out-of-scope queries

## Improvements
- **Integration with sophisticated LLMs**: This is a simple chatbot that I made with the provided code. A newer LLM with an agentic framework like LangChain will perform miles better. 
