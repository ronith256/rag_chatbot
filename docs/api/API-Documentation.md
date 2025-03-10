# RAG Chat API Documentation 📚

## Base URL
```
http://localhost:5984
```

**Swagger UI with API Doc is available at Base URL** 

## Authentication 🔐
Firebase Authentication is used. Include the Firebase token in the Authorization header:
```
Authorization: Bearer <firebase_token>
```

## Endpoints

### Agents 🤖

#### Create Agent
```http
POST /api/agents
```

**Request Body:**
```json
{
  "user_id": "string",
  "config": {
    "llm": "string",
    "embeddings_model": "string",
    "collection": "string",
    "system_prompt": "string?",
    "contextualization_prompt": "string?",
    "temperature": "float?",
    "advancedLLMConfig": {
      "model": "string",
      "base_url": "string?",
      "api_key": "string",
      "temperature": "float?",
      "api_type": "string"
    },
    "advancedEmbeddingsConfig": {
      "model": "string",
      "base_url": "string?",
      "api_key": "string?",
      "embedding_type": "string",
      "huggingface_model": "string?"
    },
    "sql_config": {
      "url": "string",
      "username": "string",
      "password": "string",
      "db_name": "string"
    },
    "s3_config": {
      "bucket_name": "string",
      "region_name": "string",
      "aws_access_key": "string",
      "aws_secret_key": "string"
    }
  }
}
```

**Response:** `RAGAgent`

#### Get User's Agents
```http
GET /api/agents/user/{user_id}
```

**Response:** `List[RAGAgent]`

#### Update Agent
```http
PATCH /api/agents/{agent_id}
```

**Request Body:** Same as Create Agent
**Response:** `RAGAgent`

#### Delete Agent
```http
DELETE /api/agents/{agent_id}?user_id={user_id}
```

**Response:**
```json
{
  "message": "Agent deleted successfully"
}
```

### Chat 💬

#### Start Chat
```http
POST /api/agents/{agent_id}/chat
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user|assistant",
      "content": "string"
    }
  ]
}
```

**Response:** Streaming text response

### Documents 📄

#### Upload Document
```http
POST /api/agents/{agent_id}/documents
```

**Request Body:** Form data with file

**Response:**
```json
{
  "job_id": "string"
}
```

#### Bulk Upload Documents
```http
POST /api/agents/{agent_id}/documents/bulk
```

**Request Body:** Form data with multiple files

**Response:**
```json
{
  "job_id": "string"
}
```

#### Get Job Status
```http
GET /api/documents/jobs/{job_id}
```

**Response:**
```json
{
  "id": "string",
  "status": "processing|completed|failed",
  "progress": "float",
  "error": "string?"
}
```

### Evaluation 📊

#### Start Evaluation
```http
POST /api/agents/{agent_id}/evaluate
```

**Request Body:** JSON file containing evaluation set
```json
[
  {
    "question": "string",
    "answer": "string"
  }
]
```

**Response:**
```json
{
  "job_id": "string"
}
```

#### Get Evaluation Status
```http
GET /api/agents/evaluation-jobs/{job_id}
```

**Response:**
```json
{
  "_id": "string",
  "agent_id": "string",
  "status": "processing|completed|failed",
  "progress": "float",
  "total_questions": "integer",
  "processed_questions": "integer",
  "created_at": "datetime",
  "errors": "string[]?"
}
```

#### Get Agent Evaluations
```http
GET /api/agents/{agent_id}/evaluations
```

**Response:** List of evaluation results with metrics

### Metrics 📈

#### Get Agent Metrics
```http
GET /api/metrics/agent/{agent_id}?start_date={datetime}&end_date={datetime}
```

**Response:**
```json
[
  {
    "agent_id": "string",
    "date": "datetime",
    "calls": "integer",
    "first_token_latency": "float",
    "total_response_time": "float"
  }
]
```

### Users 👥

#### Get Users
```http
GET /api/users
```

**Response:**
```json
[
  {
    "uid": "string",
    "email": "string"
  }
]
```

#### Share Agent
```http
POST /api/users/share-agent
```

**Request Body:**
```json
{
  "agent_id": "string",
  "target_user_ids": ["string"]
}
```

**Response:** List of shared agent copies

## Models

### RAGAgent
```json
{
  "id": "string (UUID)",
  "user_id": "string",
  "config": "RAGConfig",
  "created_at": "datetime"
}
```

### RAGConfig
```json
{
  "llm": "string",
  "embeddings_model": "string",
  "collection": "string",
  "system_prompt": "string?",
  "contextualization_prompt": "string?",
  "temperature": "float?",
  "advancedLLMConfig": "LLMConfig?",
  "advancedEmbeddingsConfig": "EmbeddingsConfig?",
  "sql_config": "SQLConfig?",
  "s3_config": "S3Config?"
}
```

### Message
```json
{
  "role": "user|assistant",
  "content": "string"
}
```

### ChatRequest
```json
{
  "agent_id": "string",
  "messages": "List[Message]"
}
```