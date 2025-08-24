# RAG Backend - FastAPI + Background Worker

A Python-based RAG (Retrieval-Augmented Generation) system with a FastAPI service and background worker for processing documents and answering questions.

## Architecture

- **FastAPI Service**: REST API with `/ask` endpoint for question answering
- **Background Worker**: SQS consumer that processes documents from S3
- **Vector Database**: ChromaDB for storing document embeddings
- **LLM Integration**: Ollama open source for generating answers
- **NestJS Integration**: API calls to update injection status

## Features

- Document processing from S3 (PDF, DOCX, TXT, CSV, MD)
- Automatic text chunking and embedding generation
- Vector similarity search for context retrieval
- RAG pipeline with OpenAI LLM
- Real-time status updates via NestJS API
- Health monitoring and statistics endpoints

## Prerequisites

- Python 3.8+
- AWS account with S3 and SQS access
- **Ollama** (free and open source LLM) - **RECOMMENDED**
- **OpenAI API key** (optional, for paid service)
- NestJS backend running

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rag-backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install additional dependencies for document processing:
```bash
pip install PyPDF2 python-docx
```

4. **Set up Ollama (FREE and Open Source LLM):**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Download a model (in another terminal)
ollama pull phi3
```

5. Set up environment variables:
```bash
cp env.template .env
# Edit .env with your configuration
```

## Usage

### Starting the FastAPI Service

```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Starting the Background Worker

```bash
python start_worker.py
```

The worker will continuously poll the SQS queue for new documents to process.

### API Endpoints

#### POST /ask
Ask a question and get an answer using the RAG pipeline.

**Request:**
```json
{
  "question": "What is the main topic of the document?",
  "max_context_results": 5,
  "file_id": "optional-file-id"
}
```

**Response:**
```json
{
  "answer": "The main topic is...",
  "context_used": [...],
  "question": "What is the main topic of the document?",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### GET /health
Health check endpoint.

#### GET /stats
Get vector database statistics.

## Document Processing Flow

1. **SQS Message**: Worker receives message with `file_key` and `file_id`
2. **Status Update**: Updates status to "QUEUE" via NestJS API
3. **S3 Download**: Downloads file from S3 bucket
4. **Text Extraction**: Extracts text based on file type
5. **Chunking**: Splits text into overlapping chunks
6. **Embedding**: Creates vector embeddings for each chunk
7. **Storage**: Stores embeddings in ChromaDB
8. **Status Update**: Updates injection status via NestJS API
9. **Cleanup**: Removes temporary files

## SQS Retry Logic

The system uses **SQS's built-in retry mechanism**:
- **MaxReceiveCount**: 3 attempts (configurable in SQS queue)
- **VisibilityTimeout**: 30 seconds (adjust based on processing time)
- **Message retention**: 4 days (default)

**Status Flow**:
- **QUEUE** → Document queued for processing
- **processing** → Document being processed (SQS attempt X/3)
- **completed** → Document successfully processed
- **failed** → Processing failed after max SQS attempts

## Supported File Types

- **Text Files**: `.txt`, `.md`
- **PDF Files**: `.pdf`
- **Word Documents**: `.docx`, `.doc`
- **CSV Files**: `.csv`

## SQS Message Format

```json
{
  "file_key": "path/to/document.pdf",
  "file_id": "unique-file-identifier"
}
```

## Development

### Project Structure

```
rag-backend/
├── main.py                 # FastAPI application
├── config.py              # Configuration management
├── requirements.txt       # Python dependencies
├── start_worker.py       # Worker startup script
├── services/             # Service layer
│   ├── s3_service.py     # S3 operations
│   ├── vector_db_service.py  # Vector database operations
│   ├── llm_service.py    # LLM integration
│   ├── nest_api_service.py   # NestJS API integration
│   └── document_processor.py # Document processing
├── worker/                # Background worker
│   └── sqs_worker.py     # SQS consumer
└── README.md             # This file
```

### Adding New File Types

To support new file types, extend the `_extract_text_content` method in `DocumentProcessor` class.

### Customizing LLM Parameters

Modify the `LLMService` class to adjust model parameters, temperature, and max tokens.

## Monitoring

- Check worker logs for document processing status
- Monitor SQS queue depth
- Use `/health` endpoint for service health
- Check `/stats` for vector database metrics

## Troubleshooting

### Common Issues

1. **S3 Access Denied**: Check AWS credentials and bucket permissions
2. **OpenAI API Errors**: Verify API key and quota limits
3. **Vector DB Issues**: Check disk space and ChromaDB configuration
4. **NestJS API Failures**: Verify API endpoint and authentication

### Logs

All services use structured logging. Check console output for detailed error messages.

## Production Considerations

- Use environment-specific configuration
- Implement proper error handling and retries
- Set up monitoring and alerting
- Configure CORS properly for production
- Implement rate limiting and authentication

