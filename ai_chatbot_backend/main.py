import json
from fastapi import FastAPI, HTTPException, status, Query, BackgroundTasks
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
from typing import Optional
from uuid import uuid4

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

    # session_token = secrets.token_hex(32)
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

        chat_history = vector_db.get(ids=[request.chat_id])
        existing_messages = json.loads(chat_history["documents"][0]) if chat_history["documents"] else []
        existing_metadata = json.loads(chat_history["metadatas"][0]["messages"]) if chat_history["metadatas"] else []

        # ✅ Generate AI response
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an AI chatbot that assists users."},
                *[ {"role": msg["role"], "content": msg["message"]} for msg in existing_metadata ],
                {"role": "user", "content": request.query}
            ],
            temperature=0.7
        )

        ai_response = response.choices[0].message.content

        new_messages = existing_messages + [request.query, ai_response]
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
                "message": ai_response,
                "session_id": request.session_id,
                "chat_id": request.chat_id,
                "timestamp": str(datetime.utcnow())
            }
        ]

        vector_db.add_texts(
            texts=[json.dumps(new_messages)],
            metadatas=[{
                "session_id": request.session_id,
                "chat_id": request.chat_id,
                "messages": json.dumps(new_metadata)
            }],
            ids=[request.chat_id]
        )

        print(f"📦 Stored in ChromaDB: chat_id={request.chat_id}")

        return {
            "response": ai_response,
            "session_id": request.session_id,
            "chat_id": request.chat_id
        }

    except Exception as e:
        print(f"❌ Chat error: {e}")
        return {"response": "Sorry, something went wrong.", "session_id": request.session_id}


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
async def get_whole_db():
    try:
        chroma_client = chromadb.PersistentClient(path="./chroma_db")
        collection = chroma_client.get_collection("chat_data")
        
        # Fetch all documents
        all_documents = collection.get()
        
        return {
            "all_documents": all_documents,
            "documents": all_documents["documents"],
            "metadatas": all_documents["metadatas"],
            "ids": all_documents["ids"]
        }
    
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