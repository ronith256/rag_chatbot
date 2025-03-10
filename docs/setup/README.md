# 🤖 RAG Agent Platform

An enterprise-grade RAG (Retrieval Augmented Generation) chat platform with advanced agent management, analytics, and evaluation capabilities.

## ✨ Features

- 🎯 Multi-model support (GPT-4, GPT-3.5, Gemini Pro, BYOM)
- 📊 Real-time analytics and metrics tracking
- 📝 Document processing and management
- 🔄 Agent configuration and customization
- 📈 Performance evaluation 
- 👥 User management and agent sharing
- 🔒 Firebase authentication
- 🎨 Modern UI with Tailwind CSS
- 🚀 Real-time streaming responses

## 🛠️ Tech Stack

### Backend
- FastAPI
- MongoDB
- Motor (async MongoDB driver)
- LangChain
- Firebase Admin SDK
- Boto3 (AWS S3)

### Frontend
- React
- TypeScript
- Tailwind CSS
- Firebase Auth
- Recharts
- Lucide Icons
- shadcn/ui components

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.11+)
- Docker and Docker Compose
- MongoDB
- Firebase account
- API keys for LLM services

### Environment Setup

1. **Backend Environment**
   Copy `.backend.env.example` to `.env` and fill in:
   ```env
   LLAMA_API_KEY=your_llama_api_key
   GEMINI_API_KEY=your_gemini_api_key
   EMBEDDINGS_API_KEY=your_embeddings_api_key
   LANGSMITH_TRACING=true
   LANGSMITH_ENDPOINT=""
   LANGSMITH_API_KEY=""
   LANGSMITH_PROJECT=""
   FIREBASE_CONFIG_PATH=firebase.json
   FRONTEND_URL="url of the frontend server"
   ```

2. **Frontend Environment**
   Copy `.frontend.env.example` to `.frontend.env` and fill in:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_ADMIN_EMAIL=ronithtg@gmail.com
   # VITE_API_URL=http://backend:5984
   VITE_BACKEND_BASE_URL=your backend url
   PORT=port to start frontend
   ```

### Installation

#### Using Docker (Recommended)

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

The application will be available at:
- Frontend: http://localhost:3349
- Backend: http://localhost:5984
- MongoDB: localhost:27017

#### Manual Setup

1. **Backend Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # Unix
   .\venv\Scripts\activate   # Windows

   # Install dependencies
   pip install -r requirements.txt

   # Start the backend server
   cd backend
   python3 main.py
   ```

2. **Frontend Setup**
   ```bash
   # Install dependencies
   npm install

   # Build Project
   npm run build

   # Start Server
   npm run frontend
   ```

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── dependencies.py
│   │   ├── config/
│   │   ├── core/
│   │   └── services/
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── types/
│   └── App.tsx
├── docker-compose.yml
├── backend.Dockerfile
└── frontend.Dockerfile
```

## 🔧 Configuration

### MongoDB Setup
The application uses MongoDB for data storage. Collections:
- `agents`: Stores agent configurations
- `metrics`: Stores usage metrics
- `evaluations`: Stores evaluation results
- `jobs`: Stores processing job status

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication with Google provider
3. Create a service account and download credentials
4. Update environment variables with Firebase configuration

### Agent Configuration
Agents can be configured with:
- Custom LLM settings
- Embeddings configurations
- SQL database connections
- S3 storage settings

## 🚀 Usage

1. **Authentication**
   - Log in using Google authentication
   - Admin users have access to user management

2. **Creating an Agent**
   - Click "Create Agent" in sidebar
   - Configure basic settings
   - Set up advanced options if needed
   - Upload training documents

3. **Using Agents**
   - Select an agent from the list
   - Upload documents for context
   - Start chatting with the agent
   - View API integration details

4. **Analytics**
   - View usage metrics
   - Monitor response times
   - Track agent performance

5. **Evaluations**
   - Upload evaluation datasets
   - Run performance tests
   - View detailed results

## 🔍 Monitoring

### Metrics Available
- Daily usage counts
- First token latency
- Total response time
- Evaluation scores
- Document processing status

### Logs
- Application logs in Docker containers
- MongoDB query logs
- Firebase authentication logs

