# Projects Overview

This repository contains two different chatbot implementations and related resources. Below is an overview of the projects:

---

## 1. **Simple Bot Implementation**

This project implements a chatbot using the following models:
- **DistilBERT** (`distilbert-base-uncased-distilled-squad`) as the LLM
- **All-MiniLM-L6-v2** as the embedding model

For more details on the Simple Bot, check out the [README](simple_nlp/README.md).

### Query Results
You can view the chatbot query results in the [query_results.json](simple_nlp/query_results.json).

---

## 2. **Full Agent Creator Using LLMs via API and LangChain**

This project provides a complete platform for creating, monitoring, and evaluating Chatbot Agents. The platform supports:
- **Adding knowledge** from various file types (PDF, DOCX, etc.)
- **Integrating multiple LLM models**, such as:
  - Gemini
  - Meta LLaMa
  - GPT (and more)

The platform is built using **LangChain** and offers an easy-to-use interface to manage and customize chatbot agents.

For more information, setup and installation instructions, refer to the [documentation](docs/setup/README.md).

### Query Results (Evaluation Set)

### Video Demo
Watch the video demo showcasing the full functionality of the **Full Agent Creator**.
&nbsp; 

[![Watch the video](https://img.youtube.com/vi/RUjI15Z04qk/0.jpg)](https://youtu.be/RUjI15Z04qk)

---

## Additional Resources

- [RAG Agents Setup (API/UI)](docs/setup/README.md)
- [RAG Agents API Reference](docs/api/API-Documentation.md)

---

