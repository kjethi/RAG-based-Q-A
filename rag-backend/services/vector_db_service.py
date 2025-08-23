import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
import logging
from config import settings
import os

logger = logging.getLogger(__name__)

class VectorDBService:
    def __init__(self):
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIRECTORY,
            settings=ChromaSettings(
                anonymized_telemetry=False
            )
        )
        
        # Initialize sentence transformer model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Get or create collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
        
        logger.info("VectorDB service initialized successfully")
    
    def create_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Create embeddings for a list of texts
        """
        try:
            embeddings = self.embedding_model.encode(texts)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error creating embeddings: {e}")
            raise
    
    def add_documents(self, documents: list[str], metadata: list[dict] = None, ids: list[str] = None):
        """
        Add documents to the vector database
        """
        try:
            if not documents:
                return
            
            # Create embeddings
            embeddings = self.create_embeddings(documents)
            
            # Generate IDs if not provided
            if ids is None:
                import uuid
                ids = [str(uuid.uuid4()) for _ in documents]
            
            # Prepare metadata
            if metadata is None:
                metadata = [{"source": "unknown"} for _ in documents]
            
            # Add to collection
            self.collection.add(
                embeddings=embeddings,
                documents=documents,
                metadatas=metadata,
                ids=ids
            )
            
            logger.info(f"Added {len(documents)} documents to vector database")
            
        except Exception as e:
            logger.error(f"Error adding documents to vector database: {e}")
            raise
    
    def search_similar(self, query: str, documentsId: list[str] = [],  n_results: int = 5,) -> list[dict]:
        """
        Search for similar documents in the vector database
        """
        try:
            # Create query embedding
            query_embedding = self.create_embeddings([query])[0]
            where = {}
            if documentsId and len(documentsId) > 0:
                where = {"documentId": {"$in": documentsId}}
            # Search in collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
                where=where   
            )
            
            # Format results
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    formatted_results.append({
                        'document': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0.0
                    })
            
            logger.info(f"Found {len(formatted_results)} similar documents for query: {query}")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching vector database: {e}")
            raise
    
    def get_collection_stats(self) -> dict:
        """
        Get statistics about the collection
        """
        try:
            count = self.collection.count()
            docs = self.collection.get(include=["metadatas", "documents"])

            return {
                "total_documents": count,
                "collection_name": self.collection.name,
                "docs": docs
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            raise
    
    def delete_documents(self, ids: list[str]):
        """
        Delete documents by IDs
        """
        try:
            self.collection.delete(ids=ids)
            logger.info(f"Deleted {len(ids)} documents from vector database")
        except Exception as e:
            logger.error(f"Error deleting documents: {e}")
            raise
