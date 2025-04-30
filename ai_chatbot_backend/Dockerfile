# Use official Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Now copy the rest of your application
COPY . .

# Expose the port FastAPI will run on
# 🔁 IMPORTANT: Render expects the app to bind to port 10000
EXPOSE 10000

# Start FastAPI using uvicorn on the correct port
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
