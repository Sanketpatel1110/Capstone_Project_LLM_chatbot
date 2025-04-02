import json
from fastapi import FastAPI, HTTPException, status, Query, BackgroundTasks, APIRouter
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import motor.motor_asyncio
import bcrypt
import uuid
import secrets
import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import traceback
from datetime import datetime
import openai
import random
import hashlib
import chromadb
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
# from langchain.docstore.document import Document
from typing import Optional, List
from uuid import uuid4
from fastapi import Body
from anyio import to_thread

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client (NEW API FORMAT)
client = openai.OpenAI(api_key=OPENAI_API_KEY)

if not OPENAI_API_KEY:
    raise ValueError("OpenAI API Key not found in environment variables.")

# MongoDB Connection
MONGO_DETAILS = os.getenv("MONGO_URL", "mongodb://localhost:27017")
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)
db = mongo_client.ai_chatbot_db
users_collection = db.get_collection("users")
chat_history_collection = db.get_collection("chat_history")
admin_content_collection = db.get_collection("admin_content")
events_collection = db.get_collection("Events")
# SMTP Email Settings
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

def generate_session_id(email: str) -> str:
    """Generate a unique session_id based on the user's email."""
    return hashlib.sha256(email.encode()).hexdigest()  # ✅ Returns a fixed-length has
# ChromaDB Setup
chroma_client = chromadb.PersistentClient(path="./chroma_db")
vector_db = Chroma(collection_name="chat_data", embedding_function=OpenAIEmbeddings(api_key=OPENAI_API_KEY), client=chroma_client)

docs_vector_db = Chroma(
    collection_name="knowledge_base",
    embedding_function=OpenAIEmbeddings(api_key=OPENAI_API_KEY),
    client=chroma_client
)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
class Content(BaseModel):
    title: str
    markdown_content: str

    
# FastAPI App
app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChatRequest(BaseModel):
    query: str
    session_id: str = None
    chat_id: str = None
    user_id: str = None
    # timestamp: str = None

class ContentUpdate(BaseModel):
    title: str
    content: str

class Event(BaseModel):
    title: str
    date_range: str
    description: str

class SessionItem(BaseModel):
    name: str
    link: str

class TakeawayItem(BaseModel):
    name: str
    link: str

class BlogModel(BaseModel):
    title: str
    date: str
    summary: str
    introduction: str
    explanation: str
    sessions: List[SessionItem]
    takeaways: List[TakeawayItem]

# Utility function to get user by email
async def get_user_by_email(email: str):
    return await users_collection.find_one({"email": email})

# Password Hashing
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# Generate a random OTP
def generate_otp():
    return str(random.randint(100000, 999999))

# Generate reset token for password recovery
def generate_reset_token():
    return secrets.token_urlsafe(32)

# Email Sending Function
def send_email(email: str, subject: str, message: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_SENDER
    msg["To"] = email
    msg.set_content(message)
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.send_message(msg)


@app.post("/api/register")
async def register(request: RegisterRequest):
    existing_user = await get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(request.password)
    new_user = {
        "name": request.name,
        "email": request.email,
        "password": hashed_password,
        "otp": None,
        "role": request.role  # role clearly stored here
    }
    await users_collection.insert_one(new_user)
    return {"message": "Registration successful"}

# ✅ Login & MFA OTP
@app.post("/api/login")
async def login(request: LoginRequest, background_tasks: BackgroundTasks):
    user = await get_user_by_email(request.email)
    if not user or not bcrypt.checkpw(request.password.encode("utf-8"), user["password"].encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    otp_code = generate_otp()
    await users_collection.update_one({"email": request.email}, {"$set": {"otp": otp_code}})
    
    background_tasks.add_task(send_email, request.email, "Your OTP Code", f"Your OTP is: {otp_code}")
    return {"message": "OTP sent to your email", "email": request.email}


@app.post("/api/chat/new")
async def start_new_chat(session_id: str = Query(...)):
    new_chat_id = str(uuid4())
    return {"message": "New chat started", "chat_id": new_chat_id}


@app.post("/api/verify-otp")
async def verify_otp(request: OTPRequest):
    user = await get_user_by_email(request.email)
    if not user or user.get("otp") != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")

    session_token = secrets.token_hex(32)
    session_id = generate_session_id(request.email)
    chat_id = str(uuid4()) 

    await users_collection.update_one({"email": request.email}, {
        "$set": {
            "session_id": session_id,
            "chat_id": chat_id
        },
        "$unset": {"otp": ""}
    }, upsert=True)

    return {
        "message": "MFA Successful",
        "session_id": session_id,
        "chat_id": chat_id,
        "role": user.get("role", "user")  # user's role clearly returned
    }

# ✅ Resend OTP
@app.post("/api/resend-otp")
async def resend_otp(request: ResendOTPRequest, background_tasks: BackgroundTasks):
    user = await get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp_code = generate_otp()
    await users_collection.update_one({"email": request.email}, {"$set": {"otp": otp_code}})

    background_tasks.add_task(send_email, request.email, "Your New OTP Code", f"Your new OTP is: {otp_code}")
    return {"message": "A new OTP has been sent to your email"}

@app.post("/api/transfer-mongo")
async def transfer_mongo():
    try:
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        embeddings = OpenAIEmbeddings(api_key=OPENAI_API_KEY)
        vector_db = Chroma(collection_name="chat_data", embedding_function=embeddings, client=chroma_client)

        documents = []

        # ✅ Transfer Users Data
        async for user in users_collection.find({}):
            user_text = f"User: {user.get('name', 'N/A')}, Email: {user.get('email', 'N/A')}, Role: {user.get('role', 'N/A')}"
            user_id = str(user["_id"])
            documents.append(Document(page_content=user_text, metadata={"type": "user", "id": user_id}))

        # ✅ Transfer Chat History Data
        async for chat in chat_history_collection.find({}):
            chat_text = f"User: {chat.get('user_id')}, Query: {chat.get('query')}, Response: {chat.get('response')}"
            chat_id = str(chat["_id"])
            documents.append(Document(page_content=chat_text, metadata={"type": "chat", "id": chat_id}))

        # ✅ Insert into ChromaDB correctly
        if documents:
            vector_db.add_documents(documents)
            return {
                "message": "✅ MongoDB data successfully transferred to ChromaDB",
                "documents_transferred": len(documents)
            }
        else:
            return {"message": "⚠️ No documents found in MongoDB."}

    except Exception as e:
        print(f"❌ Error: {e}")
        return {"error": str(e)}

# ✅ Retrieve Similar Documents (RAG)
def retrieve_relevant_content(query):
    try:
        results = vector_db.similarity_search(query, k=3)
        return " ".join([doc.page_content for doc in results])
    except Exception as e:
        return "No relevant information found."

# ✅ Generate GPT-4o Mini Response with Retrieved Content
def generate_response(query, retrieved_info):
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an AI chatbot that assists users."},
            {"role": "user", "content": f"Context: {retrieved_info}\nUser Query: {query}"},
        ],
        temperature=0.7,
        # api_key=OPENAI_API_KEY,
    )
    return response["choices"][0]["message"]["content"]

@app.get("/api/chat/all-chats")
async def get_all_chats(session_id: str = Query(...)):
    try:
        results = vector_db.get(where={"session_id": session_id})
        chats = []

        for doc, meta in zip(results["documents"], results["metadatas"]):
            chat_id = meta.get("chat_id")
            messages = json.loads(meta.get("messages", "[]"))
            preview = messages[0]["message"] if messages else "New Chat"
            chats.append({
                "chat_id": chat_id,
                "preview": preview,
                "messages": [
                    {"sender": msg["role"], "text": msg["message"]} for msg in messages
                ]
            })

        return {"chats": chats}

    except Exception as e:
        print("❌ Error in get_all_chats:", e)
        raise HTTPException(status_code=500, detail="Failed to load chats")

@app.post("/api/rag/upload")
async def upload_docs(texts: List[str] = Body(..., embed=True)):
    try:
        metadatas = [{"source": f"doc_{i}"} for i in range(len(texts))]
        docs_vector_db.add_texts(texts=texts, metadatas=metadatas)
        return {"message": f"{len(texts)} documents uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}

def generate_openai_response(messages):
    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7
    ).choices[0].message.content


# 🚀 Blocking validation call
def validate_response(prompt):
    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    ).choices[0].message.content.strip()


# 🚀 Blocking ChromaDB get
def get_vector_data(chat_id):
    return vector_db.get(ids=[chat_id])


# 🚀 Blocking ChromaDB add
def add_to_vector_db(texts, metadata, chat_id):
    return vector_db.add_texts(
        texts=[json.dumps(texts)],
        metadatas=[{
            "session_id": metadata[0]["session_id"],
            "chat_id": metadata[0]["chat_id"],
            "messages": json.dumps(metadata)
        }],
        ids=[chat_id]
    )

def generate_openai_response(messages):
    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7
    ).choices[0].message.content


# 🚀 Blocking validation call
def validate_response(prompt):
    return client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    ).choices[0].message.content.strip()


# 🚀 Blocking ChromaDB get
def get_vector_data(chat_id):
    return vector_db.get(ids=[chat_id])


# 🚀 Blocking ChromaDB add
def add_to_vector_db(texts, metadata, chat_id):
    return vector_db.add_texts(
        texts=[json.dumps(texts)],
        metadatas=[{
            "session_id": metadata[0]["session_id"],
            "chat_id": metadata[0]["chat_id"],
            "messages": json.dumps(metadata)
        }],
        ids=[chat_id]
    )

@app.post("/api/chat/")
async def chat(request: ChatRequest):
    try:
        print(f"🔍 Received: session_id={request.session_id}, chat_id={request.chat_id}, query='{request.query}'")

        if not request.session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        if not request.chat_id:
            raise HTTPException(status_code=400, detail="Chat ID is required")

        user = await users_collection.find_one({"session_id": request.session_id})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")

        # ✅ Step 1: Retrieve existing chat history
        chat_history = await to_thread.run_sync(get_vector_data, request.chat_id)
        existing_messages = json.loads(chat_history["documents"][0]) if chat_history["documents"] else []
        existing_metadata = json.loads(chat_history["metadatas"][0]["messages"]) if chat_history["metadatas"] else []

        # ✅ Step 2: Retrieve related context from docs vector DB
        retrieved_chunks = docs_vector_db.similarity_search(request.query, k=3)
        retrieved_context = "\n".join([doc.page_content for doc in retrieved_chunks])
        top_doc_response = retrieved_chunks[0].page_content if retrieved_chunks else "No context found."

        # ✅ Step 3: Generate OpenAI response with memory + context
        messages = [
            {"role": "system", "content": "You're a helpful assistant using memory and documents."},
            *[{"role": msg["role"], "content": msg["message"]} for msg in existing_metadata],
            {"role": "user", "content": f"Relevant Info:\n{retrieved_context}\n\nQuery:\n{request.query}"}
        ]
        openai_response = await to_thread.run_sync(generate_openai_response, messages)

        # ✅ Step 4: Validate between OpenAI vs Top Doc Response
        validation_prompt = f"""You are a helpful assistant evaluating two responses for a user query.

        Query: {request.query}

        Answer A (OpenAI): {openai_response}

        Answer B (From Knowledge Base): {top_doc_response}

        Which answer better addresses the user's query? Reply with 'A' or 'B' and a brief explanation.
        """
        validation_response = await to_thread.run_sync(validate_response, validation_prompt)
        print(f"✅ Validation Response: {validation_response}")

        final_answer = (
            openai_response if "A" in validation_response
            else top_doc_response if "B" in validation_response
            else openai_response
        )

        # ✅ Step 5: Save updated conversation to ChromaDB
        new_messages = existing_messages + [request.query, final_answer]
        new_metadata = existing_metadata + [
            {
                "role": "user",
                "message": request.query,
                "session_id": request.session_id,
                "chat_id": request.chat_id,
                "timestamp": str(datetime.utcnow())
            },
            {
                "role": "assistant",
                "message": final_answer,
                "session_id": request.session_id,
                "chat_id": request.chat_id,
                "timestamp": str(datetime.utcnow())
            }
        ]
        await to_thread.run_sync(add_to_vector_db, new_messages, new_metadata, request.chat_id)
        print(f"📦 Stored in ChromaDB: chat_id={request.chat_id}")

        return {
            "response": final_answer,
            "session_id": request.session_id,
            "chat_id": request.chat_id,
            "validation_summary": validation_response
        }

    except Exception as e:
        print(f"❌ Chat error: {e}")
        traceback.print_exc()
        return {
            "response": "Sorry, something went wrong.",
            "session_id": request.session_id,
            "chat_id": request.chat_id
        }

# TODO: working fine but gpt isn't learning from mistakes.
# @app.post("/api/chat/")
# async def chat(request: ChatRequest):
#     try:
#         print(f"🔍 Received: session_id={request.session_id}, chat_id={request.chat_id}, query='{request.query}'")

#         if not request.session_id:
#             raise HTTPException(status_code=400, detail="Session ID is required")
#         if not request.chat_id:
#             raise HTTPException(status_code=400, detail="Chat ID is required")

#         user = await users_collection.find_one({"session_id": request.session_id})
#         if not user:
#             raise HTTPException(status_code=401, detail="Invalid session")

#         # ✅ Retrieve existing chat history from ChromaDB
#         chat_history = vector_db.get(ids=[request.chat_id])
#         existing_messages = json.loads(chat_history["documents"][0]) if chat_history["documents"] else []
#         existing_metadata = json.loads(chat_history["metadatas"][0]["messages"]) if chat_history["metadatas"] else []

#         # ✅ Step 1: Retrieve related documents from knowledge base
#         retrieved_chunks = docs_vector_db.similarity_search(request.query, k=3)
#         retrieved_context = "\n".join([doc.page_content for doc in retrieved_chunks])
#         top_doc_response = retrieved_chunks[0].page_content if retrieved_chunks else "No context found."

#         # ✅ Step 2: Generate response using LLM and RAG context
#         openai_response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "system", "content": "You're a helpful assistant using memory and documents."},
#                 *[{"role": msg["role"], "content": msg["message"]} for msg in existing_metadata],
#                 {"role": "user", "content": f"Relevant Info:\n{retrieved_context}\n\nQuery:\n{request.query}"}
#             ],
#             temperature=0.7
#         ).choices[0].message.content

#         # openai_response = client.chat.completions.create(
#         #     model="gpt-4o-mini",
#         #     messages=[
#         #         {"role": "system", "content": "You are a helpful assistant. ONLY use the provided context to answer. If the answer is not in the context, reply with: 'I'm sorry, I couldn't find that information in the documents.'"},
#         #         *[{"role": msg["role"], "content": msg["message"]} for msg in existing_metadata],
#         #         {"role": "user", "content": f"Context:\n{retrieved_context}\n\nQuery:\n{request.query}"}
#         #     ],
#         #     temperature=0.0
#         # ).choices[0].message.content

#         # openai_response = client.chat.completions.create(
#         #     model="gpt-4o-mini",
#         #     messages=[
#         #         {"role": "system", "content": "You are a strict assistant. ONLY answer using the provided context. If the answer is not found in the context, respond with: 'Sorry, I couldn't find that information in the provided documents.' Do NOT guess or provide potentially incorrect information."},
#         #         {"role": "user", "content": f"Context:\n{retrieved_context}\n\nQuestion:\n{request.query}"}
#         #     ],
#         #     temperature=0.0  # removes creativity/hallucination
#         # ).choices[0].message.content

#         # ✅ Step 3: Ask LLM to validate which response is better
#         validation_prompt = f"""You are a helpful assistant evaluating two responses for a user query.

#         Query: {request.query}

#         Answer A (OpenAI): {openai_response}

#         Answer B (From Knowledge Base): {top_doc_response}

#         Which answer better addresses the user's query? Reply with 'A' or 'B' and a brief explanation.
#         """

#         validation_response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "user", "content": validation_prompt}
#             ],
#             temperature=0.2
#         ).choices[0].message.content.strip()

#         print(f"✅ Validation Response: {validation_response}")

#         # ✅ Decide which answer to use
#         if "A" in validation_response:
#             final_answer = openai_response
#         elif "B" in validation_response:
#             final_answer = top_doc_response
#         else:
#             final_answer = openai_response  # fallback

#         # ✅ Store updated chat in ChromaDB
#         new_messages = existing_messages + [request.query, final_answer]
#         new_metadata = existing_metadata + [
#             {
#                 "role": "user",
#                 "message": request.query,
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "timestamp": str(datetime.utcnow())
#             },
#             {
#                 "role": "assistant",
#                 "message": final_answer,
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "timestamp": str(datetime.utcnow())
#             }
#         ]

#         vector_db.add_texts(
#             texts=[json.dumps(new_messages)],
#             metadatas=[{
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "messages": json.dumps(new_metadata)
#             }],
#             ids=[request.chat_id]
#         )

#         print(f"📦 Stored in ChromaDB: chat_id={request.chat_id}")

#         return {
#             "response": final_answer,
#             "session_id": request.session_id,
#             "chat_id": request.chat_id,
#             "validation_summary": validation_response  # (optional for debugging)
#         }

#     except Exception as e:
#         print(f"❌ Chat error: {e}")
#         traceback.print_exc()
#         return {"response": "Sorry, something went wrong.", "session_id": request.session_id}

# @app.post("/api/chat/")
# async def chat(request: ChatRequest):
#     try:
#         print(f"🔍 Received: session_id={request.session_id}, chat_id={request.chat_id}, query='{request.query}'")

#         if not request.session_id:
#             raise HTTPException(status_code=400, detail="Session ID is required")
#         if not request.chat_id:
#             raise HTTPException(status_code=400, detail="Chat ID is required")

#         # ✅ Authenticate user
#         user = await users_collection.find_one({"session_id": request.session_id})
#         if not user:
#             raise HTTPException(status_code=401, detail="Invalid session")

#         # ✅ Retrieve existing chat history from ChromaDB
#         chat_history = vector_db.get(ids=[request.chat_id])
#         existing_messages = json.loads(chat_history["documents"][0]) if chat_history["documents"] else []
#         existing_metadata = json.loads(chat_history["metadatas"][0]["messages"]) if chat_history["metadatas"] else []

#         # ✅ Step 1: Retrieve related documents from knowledge base
#         retrieved_chunks = docs_vector_db.similarity_search(request.query, k=3)
#         retrieved_context = "\n".join([doc.page_content for doc in retrieved_chunks])
#         top_doc_response = retrieved_chunks[0].page_content if retrieved_chunks else "No context found."

#         # ✅ Step 2: Build prompt using only past *correct* messages
#         validated_history = [
#             {"role": msg["role"], "content": msg["message"]}
#             for msg in existing_metadata[-6:] if msg["role"] == "user" or msg.get("correct", True)
#         ]

#         messages = [
#             {"role": "system", "content": "You're a helpful assistant using memory and documents."},
#             *validated_history,
#             {"role": "user", "content": f"Relevant Info:\n{retrieved_context}\n\nQuery:\n{request.query}"}
#         ]

#         openai_response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=messages,
#             temperature=0.7
#         ).choices[0].message.content

#         # ✅ Step 3: Ask LLM to validate which answer is better
#         validation_prompt = f"""You are a helpful assistant evaluating two responses for a user query.

#         Query: {request.query}

#         Answer A (OpenAI): {openai_response}

#         Answer B (From Knowledge Base): {top_doc_response}

#         Which answer better addresses the user's query? Reply with 'A' or 'B' and a brief explanation.
#         """

#         validation_response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": validation_prompt}],
#             temperature=0.2
#         ).choices[0].message.content.strip()

#         print(f"✅ Validation Response: {validation_response}")

#         use_openai = "A" in validation_response
#         final_answer = openai_response if use_openai else top_doc_response

#         # ✅ Store incorrect OpenAI answers in MongoDB (optional)
#         if not use_openai:
#             await mistakes_collection.insert_one({
#                 "query": request.query,
#                 "wrong_answer": openai_response,
#                 "correct_answer": top_doc_response,
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "timestamp": datetime.utcnow()
#             })

#         # ✅ Store updated conversation with validation metadata
#         new_messages = existing_messages + [request.query, final_answer]
#         new_metadata = existing_metadata + [
#             {
#                 "role": "user",
#                 "message": request.query,
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "timestamp": str(datetime.utcnow())
#             },
#             {
#                 "role": "assistant",
#                 "message": final_answer,
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "timestamp": str(datetime.utcnow()),
#                 "source": "openai" if use_openai else "kb",
#                 "correct": use_openai
#             }
#         ]

#         # ✅ Use unique vector ID per message for ChromaDB
#         unique_vector_id = f"{request.chat_id}_{str(uuid.uuid4())}"
#         vector_db.add_texts(
#             texts=[json.dumps(new_messages)],
#             metadatas=[{
#                 "session_id": request.session_id,
#                 "chat_id": request.chat_id,
#                 "messages": json.dumps(new_metadata)
#             }],
#             ids=[unique_vector_id]
#         )

#         print(f"📦 Stored in ChromaDB: chat_id={request.chat_id}, vector_id={unique_vector_id}")

#         return {
#             "response": final_answer,
#             "session_id": request.session_id,
#             "chat_id": request.chat_id,
#             "validation_summary": validation_response  # optional, for debugging or UI display
#         }

#     except Exception as e:
#         print(f"❌ Chat error: {e}")
#         traceback.print_exc()
#         return {"response": "Sorry, something went wrong.", "session_id": request.session_id}

@app.get("/api/chat/history")
async def get_chat_history(
    session_id: str = Query(..., description="Chat session ID"),
    chat_id: str = Query(..., description="Chat ID")
):
    try:
        print(f"🔍 Fetching chat history for session_id={session_id} and chat_id={chat_id}")

        # ✅ Fetch messages from ChromaDB using chat_id
        results = vector_db.get(where={"chat_id": chat_id})

        print(f"🔎 Raw ChromaDB results: {results}")

        if not results or not results.get("documents"):
            print("⚠️ No chat history found for this chat_id")
            return {"session_id": session_id, "chat_id": chat_id, "history": []}

        # ✅ Messages are stored as a JSON string, so we need to parse them
        stored_messages = json.loads(results["documents"][0])
        stored_metadata = json.loads(results["metadatas"][0]["messages"])

        messages = []
        for i in range(len(stored_messages)):
            msg = {
                "role": stored_metadata[i]["role"],
                "message": stored_messages[i],
                "timestamp": stored_metadata[i].get("timestamp", "")
            }
            messages.append(msg)

        # ✅ Sort messages by timestamp before returning
        messages.sort(key=lambda x: x["timestamp"])

        print(f"✅ Final formatted chat history: {messages}")
        
        return {
            "session_id": session_id,
            "chat_id": chat_id,
            "history": messages
        }

    except Exception as e:
        print(f"❌ Error fetching ChromaDB history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve chat history from ChromaDB.")

@app.delete("/api/chat/delete")
async def delete_chat(session_id: str = Body(...), chat_id: str = Body(...)):
    try:
        vector_db.delete(ids=[chat_id])  # Use ChromaDB delete API
        return {"message": "Chat deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/blogs")
async def store_blog(blog: BlogModel):
    try:
        # ✅ Get current max blog ID from vector DB
        existing_docs = docs_vector_db.get()
        existing_ids = [
            doc_meta.get("id", 0)
            for doc_meta in existing_docs["metadatas"]
            if isinstance(doc_meta.get("id", None), int)
        ]
        next_id = max(existing_ids, default=0) + 1

        # ✅ Format the full blog content for vector storage
        formatted_content = (
            f"ID: {next_id}\n"
            f"Title: {blog.title}\n"
            f"Date: {blog.date}\n"
            f"Summary: {blog.summary}\n"
            f"Introduction: {blog.introduction}\n"
            f"Explanation: {blog.explanation}\n"
        )

        for session in blog.sessions:
            formatted_content += f"Session: {session.name} - {session.link}\n"
        for takeaway in blog.takeaways:
            formatted_content += f"Takeaway: {takeaway.name} - {takeaway.link}\n"

        # ✅ Convert to string to avoid Chroma metadata error
        sessions_json = json.dumps([s.dict() for s in blog.sessions])
        takeaways_json = json.dumps([t.dict() for t in blog.takeaways])

        # ✅ Store in vector DB
        docs_vector_db.add_texts(
            texts=[formatted_content],
            metadatas=[{
                "id": next_id,
                "title": blog.title,
                "date": blog.date,
                "summary": blog.summary,
                "introduction": blog.introduction,
                "explanation": blog.explanation,
                "sessions": sessions_json,
                "takeaways": takeaways_json
            }]
        )

        return {"message": f"✅ Blog stored successfully with ID {next_id}", "id": next_id}

    except Exception as e:
        print("❌ Error storing blog:", e)
        raise HTTPException(status_code=500, detail="Failed to store blog in vector DB")
    

@app.get("/api/all-blogs")
async def get_all_blogs():
    try:

        # Get all documents
        all_data = docs_vector_db.get()

        blogs = []
        for metadata in all_data["metadatas"]:
            # Only return blogs that contain full blog metadata
            if all(key in metadata for key in ["id", "title", "date", "summary", "introduction", "explanation", "sessions", "takeaways"]):
                try:
                    blog = {
                        "id": metadata["id"],
                        "title": metadata["title"],
                        "date": metadata["date"],
                        "summary": metadata["summary"],
                        "introduction": metadata["introduction"],
                        "explanation": metadata["explanation"],
                        "sessions": json.loads(metadata["sessions"]),
                        "takeaways": json.loads(metadata["takeaways"])
                    }
                    blogs.append(blog)
                except Exception as e:
                    print(f"⚠️ Skipping blog with invalid metadata: {e}")
                    continue

        return blogs

    except Exception as e:
        print(f"❌ Error fetching blogs from ChromaDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blogs from vector DB")

# ✅ API Status Endpoints
@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI using MongoDB and ChromaDB"}

@app.get("/api/status")
async def get_status():
    return {"status": "Server is up and running"}

@app.post("/api/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    user = await get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    reset_token = secrets.token_urlsafe(32)
    await users_collection.update_one({"email": request.email}, {"$set": {"reset_token": reset_token, "reset_token_expiry": datetime.utcnow()}})
    
    reset_link = f"http://localhost:3000/reset-password/{reset_token}"
    background_tasks.add_task(send_email, request.email, "Password Reset Request", f"Click here to reset your password: {reset_link}")
    
    return {"message": "Password reset link has been sent to your email"}

# ✅ Reset Password API
@app.post("/api/reset-password")
async def reset_password(request: ResetPasswordRequest):
    user = await users_collection.find_one({"reset_token": request.token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    hashed_password = hash_password(request.new_password)
    await users_collection.update_one({"reset_token": request.token}, {"$set": {"password": hashed_password}, "$unset": {"reset_token": "", "reset_token_expiry": ""}})
    
    return {"message": "Password reset successful"}

@app.get("/api/check-chromadb")
async def check_chromadb():
    try:
        # ✅ Connect to ChromaDB
        chroma_client = chromadb.PersistentClient(path="./chroma_db")

        # ✅ List collection names
        collection_names = chroma_client.list_collections()
        
        if not collection_names:
            return {"message": "⚠️ No collections found in ChromaDB."}

        # ✅ Fetch details for each collection
        collection_data = {}
        for collection_name in collection_names:
            vector_db = chroma_client.get_collection(collection_name)  # ✅ Fix: Now correctly fetches the collection
            doc_count = vector_db.count()  # ✅ Get document count
            stored_docs = vector_db.get()  # ✅ Fetch stored documents (limited to 5)
            sample_documents = stored_docs["documents"][:5] if "documents" in stored_docs and stored_docs["documents"] else []

            collection_data[collection_name] = {
                "document_count": doc_count,
                "sample_documents": sample_documents,
            }

        return {
            "collections": collection_names,
            "details": collection_data
        }

    except Exception as e:
        return {"error": str(e)}

# Create Content
@app.post("/api/admin/add-markdown-content")
async def add_markdown_content(content: Content):
    doc_id = str(uuid.uuid4())
    await admin_content_collection.insert_one({
        "_id": doc_id,
        "title": content.title,
        "markdown_content": content.markdown_content
    })
    return {"message": "Content added", "id": doc_id}

# Read All Content
@app.get("/api/admin/get-markdown-content")
async def get_markdown_content():
    contents = await admin_content_collection.find({}).to_list(100)
    return contents

# Update Content
@app.put("/api/admin/update-markdown-content/{content_id}")
async def update_markdown_content(content_id: str, content: Content):
    result = await admin_content_collection.update_one(
        {"_id": content_id},
        {"$set": content.dict()}
    )
    if result.modified_count == 0:
        raise HTTPException(404, "Content not found or no changes made")
    return {"message": "Content updated"}

# Delete Content
@app.delete("/api/admin/delete-markdown-content/{content_id}")
async def delete_markdown_content(content_id: str):
    result = await admin_content_collection.delete_one({"_id": content_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Content not found")
    return {"message": "Content deleted"}

@app.get("/api/get-whole-db")
async def get_whole_db(collection_name: str = Query(..., description="Name of the vector DB collection (e.g., 'chat_data' or 'knowledge_base')")):
    try:
        chroma_client = chromadb.PersistentClient(path="./chroma_db")

        # Get list of available collections (just names in v0.6.0+)
        available_collections = chroma_client.list_collections()

        if collection_name not in available_collections:
            raise HTTPException(
                status_code=404,
                detail=f"Collection '{collection_name}' not found. Available: {available_collections}"
            )

        # Access the collection directly
        collection = chroma_client.get_collection(name=collection_name)

        # Fetch all documents
        all_documents = collection.get()

        return {
            "collection_name": collection_name,
            "total_documents": len(all_documents["documents"]),
            "documents": all_documents["documents"],
            "metadatas": all_documents["metadatas"],
            "ids": all_documents["ids"]
        }

    except Exception as e:
        print("❌ Error getting whole DB:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/delete-collection")
async def delete_collection(collection_name: str = Query(...)):
    try:
        chroma_client = chromadb.PersistentClient(path="./chroma_db")

        # Check if collection exists
        available_collections = chroma_client.list_collections()
        if collection_name not in available_collections:
            raise HTTPException(status_code=404, detail=f"Collection '{collection_name}' not found.")

        # Delete collection
        chroma_client.delete_collection(name=collection_name)

        return {"message": f"✅ Collection '{collection_name}' deleted successfully."}
    
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/add-event/")
async def add_event(event: Event):
    event_data = event.dict()
    await events_collection.insert_one(event_data)  # Use correct collection
    return {"message": "Event added successfully"}

# ✅ API to Get Events
@app.get("/events/", response_model=List[Event])
async def get_events():
    events_cursor = events_collection.find({}, {"_id": 0})  # Exclude MongoDB ID
    events_list = await events_cursor.to_list(length=100)
    return events_list