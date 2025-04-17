# Capstone Project – AI-Powered Chatbot for Urban Systems Ltd.

## Project Overview

This Capstone project presents a robust AI-powered chatbot solution designed for **Urban Systems Ltd.**, a leading civil engineering consulting firm. The system addresses internal knowledge retrieval challenges by integrating natural language understanding, vector-based semantic search, and user-friendly interfaces.

The chatbot is developed to support secure multi-user access, content management, and document-based retrieval to enhance information accessibility and operational efficiency within the organization.


---

## Key Features

- **AI Chatbot (GPT-4o Mini)**  
  Provides accurate, context-aware responses using OpenAI’s GPT-4o mini language model.

- **Semantic Search with RAG**  
  Combines ChromaDB vector search and OpenAI completions for reliable, document-backed responses.

- **User Authentication**  
  Includes registration, login, and multi-factor authentication via email-based OTP.

- **Role-Based Access Control (RBAC)**  
  Differentiates permissions for general users and administrators.

- **Markdown-Based Content Management**  
  Allows administrators to add, edit, and manage informational content easily.

- **Blog and Event Management**  
  Supports submission and retrieval of blogs and event records.

- **Password Recovery**  
  Implements secure, OTP-based password reset functionality.

---

## Technology Stack

| Layer         | Technology                     |
|---------------|---------------------------------|
| Frontend      | React.js, Tailwind CSS, Axios   |
| Backend       | FastAPI (Python), OpenAI GPT API|
| Databases     | MongoDB, ChromaDB               |
| Auth & Email  | SMTP, Python `secrets`, bcrypt  |
| Deployment    | Local or cloud environments     |

---

## Industry Collaboration

This project was developed in partnership with **Urban Systems Ltd.**, with key contributions including:

- Technical guidance through weekly project meetings
- GPT-4o mini tokens for development and testing
- Collaboration support via Microsoft Teams
- In-person workshop on LLMs and system integration

---

## Project Timeline

- **Start Date:** February 5, 2025  
- **End Date:** March 31, 2025

---

## System Architecture

1. Users log in with OTP-based authentication.
2. Messages are embedded using OpenAI embeddings and stored in ChromaDB.
3. The chatbot retrieves the most relevant documents using vector search.
4. Context is passed to OpenAI GPT-4o mini for accurate, natural responses.
5. All data (users, messages, blogs) is stored securely in MongoDB.

---

## Setup Instructions

To set up and run the full application locally:

```bash
# 1. Clone the repository
git clone https://github.com/Sanketpatel1110/Capstone_Project_LLM_chatbot.git
cd Capstone_Project_LLM_chatbot

# 2. Frontend setup
cd ai_chatbot_frontend
npm install
npm start
# Frontend will run at http://localhost:3000

# 3. Backend setup
cd ai_chatbot_backend
pip install -r requirements.txt
uvicorn main:app --reload
# Backend will run at http://localhost:8000




---

