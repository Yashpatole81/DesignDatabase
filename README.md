## 🧠 Overview

**DesignDatabase** is an AI-powered platform that simplifies database design by combining a visual schema builder with intelligent assistance from a Large Language Model (LLM).

Instead of manually designing complex database structures, users can start with a basic table or idea and use natural language prompts to generate a complete, well-structured database schema. The system intelligently expands the design by adding relevant tables, relationships, and constraints based on the given context.

The platform focuses on a **human-in-the-loop approach**, where users design or guide the schema while AI enhances and completes it. This ensures both control and automation, making the process faster, more accurate, and beginner-friendly.

DesignDatabase operates in a **schema-only (safe) mode**, meaning it generates and validates SQL without executing it on a real database. This makes it ideal for learning, prototyping, and hackathon environments.

By combining visual design, AI-driven generation, and validation, DesignDatabase acts as an **AI Database Architect**, helping developers move from idea to structured schema efficiently.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8080

# Start with auto-reload (development)
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 🌐 URLs

| Service  | URL                         |
|----------|-----------------------------|
| Backend  | http://localhost:8080        |
| API Docs | http://localhost:8080/docs   |
| Frontend | http://localhost:5173        |

## ⚙️ Configuration

### Backend (.env)
```env
LLM_API_URL=http://wiphackxlw49hx.cloudloka.com:8000/v1/chat/completions
MODEL_NAME=Qwen/Qwen3-8B
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080
```

**Note:** After changing `.env` files, restart the respective service.

