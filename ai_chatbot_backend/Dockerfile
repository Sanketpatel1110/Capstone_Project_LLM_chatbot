FROM python:3.10-slim

WORKDIR /app

# Use correct path
COPY ai_chatbot_backend/requirements.txt .

RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy rest of backend app
COPY ai_chatbot_backend/ .

EXPOSE 10000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
