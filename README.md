# Advanced LLM-Powered AI Chatbot for Efficient Information Retrieval

## Project Overview
This project is an advanced, LLM-powered AI Chatbot developed to enhance information retrieval within Urban Systems Ltd., a dynamic civil engineering consulting firm. The solution addresses key challenges such as fragmented information storage, inefficient retrieval methods, and limited interactivity of existing internal resources.

## Project Description
The AI Chatbot is integrated into a user-friendly frontend, allowing non-technical users to efficiently add, edit, and manage content. It leverages state-of-the-art Large Language Models (LLMs), specifically OpenAI's GPT series, to provide accurate and contextually relevant responses to user queries. Key functionalities include seamless integration with internal databases, efficient semantic information retrieval, secure user authentication, and an intuitive administrative interface.

## Deployment
The project is fully deployed on Render, including both frontend and database components, providing robust, scalable, and secure cloud infrastructure.

- **Frontend:** Deployed on Render using Docker. [Access the Frontend Here](https://chatbot-frontend-ntjv.onrender.com)
- **Database:** MongoDB (structured data & chat history) and ChromaDB (vector database for semantic search), both hosted on Render.

## Technologies Used
- **Frontend:** React.js, TailwindCSS, Axios
- **Backend:** FastAPI (Python), OpenAI GPT API
- **Database:** MongoDB, ChromaDB
- **Authentication:** Multi-Factor Authentication (MFA) using SMTP

## Key Features
- **Interactive AI Chatbot:** Powered by GPT-4o mini to deliver precise and contextually accurate responses.
- **Content Management Interface:** Allows non-technical users to easily manage site content through markdown editing.
- **Efficient Information Retrieval:** Implements Retrieval Augmented Generation (RAG) for enhanced query accuracy.
- **Secure Authentication:** Robust user verification and MFA via SMTP.
- **Role-Based Access Control (RBAC):** Ensures users have appropriate permissions and access.

## Challenges and Solutions
- **User Validation:** Implemented email verification during registration to enhance security.
- **Password Reset:** Developed OTP-based password recovery for user convenience.
- **Optimizing API Requests:** Improved response times through caching and optimized request handling.
- **Access Management:** Established RBAC for secure and precise user permissions.

## Project Timeline
- **Start Date:** February 5, 2025
- **Completion Date:** March 31, 2025


## Contributions by Industry Partner (Urban Systems Ltd.)
- Technical guidance through weekly meetings
- Software tokens provided for GPT-4o mini
- Access to collaboration tools (Microsoft Teams)
- Conducted an in-person LLM workshop

---

## Getting Started
Clone the repository, install dependencies, and deploy locally or explore the hosted solution on Render.

```bash
git clone <repository_url>
cd project_directory
npm install
npm run dev
```

For backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

