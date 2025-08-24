import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Settings:
    # AWS Configuration
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    AWS_SQS_QUEUE_URL = os.getenv("AWS_SQS_QUEUE_URL")
    AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")

    # SQS Configuration
    MAX_SQS_ATTEMPTS = int(os.getenv("MAX_SQS_ATTEMPTS", "3"))

    # Ollama Configuration (free and open source)
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama2")  # llama2, mistral, codellama, phi2
    
    # Vector DB Configuration
    CHROMA_PERSIST_DIRECTORY = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
    
    # Service Authentication
    NEST_SERVICE_ID: str = os.getenv("NEST_SERVICE_ID", "python-rag-service")
    NEST_SERVICE_SECRET: str = os.getenv("NEST_SERVICE_SECRET", "test-secret")
    NEST_API_BASE_URL: str = os.getenv("NEST_API_BASE_URL", "http://localhost:3001")

settings = Settings()
