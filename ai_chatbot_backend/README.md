# AI Chatbot Backend – FastAPI, MongoDB, and ChromaDB

This project provides the backend for an AI-powered chatbot system that uses OpenAI’s GPT-4o-mini model, ChromaDB for memory and search, and MongoDB for structured data. The system supports user authentication with OTP, AI chat with context retention, document-based response generation, blog and event management, and admin content controls.

---

## Features

### Authentication and Security
- Register and log in using email-based OTP (Multi-Factor Authentication)
- Reset password via secure email token
- Unique session and chat IDs for tracking

### Chat Functionality
- Supports GPT-4o-mini for natural language conversations
- Remembers past messages using ChromaDB vector storage
- Generates validated responses by comparing AI and document content
- Stores and retrieves full chat history

### Content and Event Management
- Submit and manage blogs with summaries, sessions, and takeaways
- Manage markdown-based content through admin interface
- Create and list scheduled events

### Developer Tools
- Migrate existing MongoDB data to ChromaDB
- View and manage ChromaDB vector collections
- API is CORS-enabled for frontend integration

---

## Technology Stack

- FastAPI (Python backend framework)
- MongoDB with Motor (asynchronous driver)
- ChromaDB with LangChain and OpenAI Embeddings
- GPT-4o-mini from OpenAI
- SMTP for sending OTPs and reset emails

---

## Environment Configuration

Create a `.env` file in your project root with the following content:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# MongoDB Connection
MONGO_URL=mongodb://localhost:27017

# SMTP Configuration
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
