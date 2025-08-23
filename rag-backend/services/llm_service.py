import logging
from config import settings
from typing import List, Dict, Any
import httpx
import json

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self, ):
         # Ollama configuration (completely free and open source)
        self.ollama_base_url = getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        self.model = getattr(settings, 'OLLAMA_MODEL', 'phi3')  # or 'llama2'
        self.max_tokens = 1000
        self.temperature = 0.7
    
    async def generate_answer(self, question: str, context: List[Dict[str, Any]]) -> str:
        # Generate an answer using the LLM based on the question and retrieved context
        
        try:
            # Prepare context for the prompt
            context_text = self._prepare_context(context)
            
            # Create the prompt
            prompt = self._create_prompt(question, context_text)
            
            # Use Ollama (free and open source)
            ans = await self._generate_ollama_answer(prompt)
            return ans
                
        except Exception as e:
            logger.error(f"Unexpected error in LLM service: {e}")
            return "Sorry, I encountered an unexpected error while processing your question."
    
    async def _generate_ollama_answer(self, prompt: str) -> str:
        # Generate answer using Ollama (free and open source)
        try:
            async with httpx.AsyncClient() as client:
                    payload = {
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": self.temperature,
                            "num_predict": self.max_tokens
                        }
                    }
                    print(f"{self.ollama_base_url}/api/generate")
                    response = await client.post(
                        f"{self.ollama_base_url}/api/generate",
                        json=payload,
                        timeout=120.0
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        return result.get('response', '').strip()
                    else:
                        logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                        return f"Error calling Ollama API: {response.status_code}"       
            
        except Exception as e:
            logger.error(f"Ollama API error: {e}")
            return f"Sorry, I encountered an error while processing your question: {str(e)}"
    
    def _prepare_context(self, context: List[Dict[str, Any]]) -> str:
        # Prepare the context for the prompt
        if not context:
            return "No relevant context found."
        
        context_parts = []
        for i, item in enumerate(context, 1):
            doc_text = item.get('document', '')
            metadata = item.get('metadata', {})
            source = metadata.get('source', 'Unknown source')
            
            context_parts.append(f"Context {i} (Source: {source}):\n{doc_text}\n")
        
        return "\n".join(context_parts)
    
    def _create_prompt(self, question: str, context: str) -> str:
        """
        Create the prompt for the LLM
        """
        return f"""Based on the following context, please answer the question below.

        Context:
        {context}

        Question: {question}

        Please provide a clear and concise answer based only on the information provided in the context. If the context doesn't contain enough information to answer the question completely, please say so."""
    
    def set_model(self, model: str):
        """
        Set the LLM model to use
        """
        self.model = model
        logger.info(f"LLM model set to: {model}")
    
   