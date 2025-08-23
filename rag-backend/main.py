from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import List, Dict, Any
import uvicorn
from datetime import datetime
from config import settings
from services.vector_db_service import VectorDBService
from services.llm_service import LLMService
from services.nest_api_service import NestAPIService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RAG Backend API",
    description="RAG-based question answering system with vector database",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
vector_db_service = VectorDBService()
llm_service = LLMService()
nest_api_service = NestAPIService()

# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    max_context_results: int = 5
    file_id: List[str] = None  # Optional: limit search to specific file

class QuestionResponse(BaseModel):
    answer: str
    context_used: List[Dict[str, Any]]
    question: str
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    vector_db_status: str
    timestamp: str

@app.get("/", response_model=Dict[str, str])
async def root():
    """
    Root endpoint
    """
    return {"message": "RAG Backend API is running"}

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """
    Ask a question and get an answer using RAG pipeline
    """
    try:
        logger.info(f"Processing question: {request.question[:100]}...")
        
        # Get relevant context from vector database
        context_results = vector_db_service.search_similar(
            query=request.question,
            documentsId = request.file_id, # search within specific files if provided
            n_results=request.max_context_results,
        )
        
        if not context_results:
            logger.warning("No relevant context found for the question")
            return QuestionResponse(
                answer="I couldn't find any relevant information to answer your question. Please try rephrasing or ask about a different topic.",
                context_used=[],
                question=request.question,
                timestamp=datetime.utcnow().isoformat() + "Z"
            )
        
        # Generate answer using LLM with retrieved context
        answer = await llm_service.generate_answer(request.question, context_results)
        
        # Prepare response
        from datetime import datetime
        response = QuestionResponse(
            answer=answer,
            context_used=context_results,
            question=request.question,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        
        logger.info(f"Successfully generated answer for question: {request.question[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Only for development/testing purposes
@app.get("/stats")
async def get_stats():
    """
    Get statistics about the vector database
    """
    try:
        stats = vector_db_service.get_collection_stats()
        
        return {
            "vector_database": stats,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving statistics: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
