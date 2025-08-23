import os
import logging
from typing import List, Dict, Any
from services.s3_service import S3Service
from services.vector_db_service import VectorDBService
from services.nest_api_service import NestAPIService

logger = logging.getLogger(__name__)

class DocumentProcessor:
    def __init__(self):
        self.s3_service = S3Service()
        self.vector_db_service = VectorDBService()
        self.nest_api_service = NestAPIService()
    
    async def process_document(self, file_key: str, documentId: str, sqs_attempt: int = 1, max_sqs_attempts: int = 3):
        """
        Process a document: download from S3, extract text, create embeddings, and store in vector DB
        """
     
        try:
            # Update status to processing
            await self.nest_api_service.update_injection_status(
                documentId=documentId,
                status="processing",
                message=f"Document processing started (SQS attempt {sqs_attempt}/{max_sqs_attempts})"
            )
            
            # Download file from S3
            local_file_path = self.s3_service.download_file(file_key)
            
            try:
                # Extract text content
                text_chunks = self._extract_text_content(local_file_path, file_key)
                
                if not text_chunks:
                    logger.info(f"No text content could be extracted from the document: {file_key}")
                    return {"status": 'failed', "message": 'No text content could be extracted from the document'}
                
                # Create metadata for each chunk
                metadata_list = []
                for i, chunk in enumerate(text_chunks):
                    metadata = {
                        "source": file_key,
                        "documentId": documentId,
                        "chunk_index": i,
                        "total_chunks": len(text_chunks),
                        "file_type": self._get_file_extension(file_key)
                    }
                    metadata_list.append(metadata)
                
                # Store in vector database
                self.vector_db_service.add_documents(
                    documents=text_chunks,
                    metadata=metadata_list
                )
                
                # Update status to completed
                await self.nest_api_service.update_injection_status(
                    documentId=documentId,
                    status="completed",
                    message=f"Successfully processed {len(text_chunks)} text chunks"
                )
                
                logger.info(f"Successfully processed document {file_key} with {len(text_chunks)} chunks")
            except Exception as e:
                logger.error(f"Error processing document {file_key} (SQS attempt {sqs_attempt}/{max_sqs_attempts}): {e}")
                return {"status": 'failed', "message": 'Error processing document'}
        
            finally:
                # Clean up temporary file
                self.s3_service.delete_local_file(local_file_path)
                return {"status": 'success', "message": f'Processed {len(text_chunks)} chunks'}
                
            
        except Exception as e:
            logger.error(f"Error processing document {file_key} (SQS attempt {sqs_attempt}/{max_sqs_attempts}): {e}")
            return {"status": 'failed', "message": 'Error processing document'}
    
    def _extract_text_content(self, file_path: str, file_key: str) -> List[str]:
        """
        Extract text content from different file types
        """
        file_extension = self._get_file_extension(file_key).lower()
        
        try:
            if file_extension in ['txt', 'md']:
                return self._extract_text_file(file_path)
            elif file_extension in ['pdf']:
                return self._extract_pdf_content(file_path)
            elif file_extension in ['docx', 'doc']:
                return self._extract_word_content(file_path)
            elif file_extension in ['csv']:
                return self._extract_csv_content(file_path)
            else:
                logger.warning(f"Unsupported file type: {file_extension}")
                return []
                
        except Exception as e:
            logger.error(f"Error extracting content from {file_path}: {e}")
            return []
    
    def _extract_text_file(self, file_path: str) -> List[str]:
        """
        Extract text from plain text files
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            return self._chunk_text(content)
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    content = file.read()
                return self._chunk_text(content)
            except Exception as e:
                logger.error(f"Error reading text file with latin-1 encoding: {e}")
                return []
    
    def _extract_pdf_content(self, file_path: str) -> List[str]:
        """
        Extract text from PDF files
        """
        try:
            import PyPDF2
            text_chunks = []
            
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text.strip():
                        text_chunks.append(text)
            
            # Flatten and chunk the text
            all_text = " ".join(text_chunks)
            return self._chunk_text(all_text)
            
        except ImportError:
            logger.error("PyPDF2 not installed. Install with: pip install PyPDF2")
            return []
        except Exception as e:
            logger.error(f"Error extracting PDF content: {e}")
            return []
    
    def _extract_word_content(self, file_path: str) -> List[str]:
        """
        Extract text from Word documents
        """
        try:
            from docx import Document
            doc = Document(file_path)
            text_chunks = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text_chunks.append(paragraph.text)
            
            # Flatten and chunk the text
            all_text = " ".join(text_chunks)
            return self._chunk_text(all_text)
            
        except ImportError:
            logger.error("python-docx not installed. Install with: pip install python-docx")
            return []
        except Exception as e:
            logger.error(f"Error extracting Word document content: {e}")
            return []
    
    def _extract_csv_content(self, file_path: str) -> List[str]:
        """
        Extract text from CSV files
        """
        try:
            import csv
            text_chunks = []
            
            with open(file_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.reader(file)
                for row_num, row in enumerate(csv_reader):
                    if row:  # Skip empty rows
                        row_text = " | ".join(str(cell) for cell in row if cell)
                        if row_text.strip():
                            text_chunks.append(f"Row {row_num + 1}: {row_text}")
            
            return text_chunks
            
        except Exception as e:
            logger.error(f"Error extracting CSV content: {e}")
            return []
    
    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into overlapping chunks
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                for i in range(end, max(start + chunk_size - 100, start), -1):
                    if text[i] in '.!?':
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks
    
    def _get_file_extension(self, file_key: str) -> str:
        """
        Get file extension from file key
        """
        return os.path.splitext(file_key)[1][1:] if '.' in file_key else ''
