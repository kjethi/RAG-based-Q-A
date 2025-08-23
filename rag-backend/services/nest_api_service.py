import httpx
import logging
from config import settings
from typing import Dict, Any

logger = logging.getLogger(__name__)

class NestAPIService:
    def __init__(self):
        self.base_url = settings.NEST_API_BASE_URL
        self.api_key = settings.NEST_API_KEY
        self.headers = {
            # "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        } if self.api_key else {"Content-Type": "application/json"}
    
    async def update_injection_status(self, documentId: str, status: str, message: str = None) -> Dict[str, Any]:
        """
        Update the injection status in NestJS API
        """
        try:
            async with httpx.AsyncClient() as client:
                payload = {
                    "status": status,
                    "message": message,
                }
                logger.info(f"{self.base_url}/documents/{documentId}")
                response = await client.patch(
                    f"{self.base_url}/documents/{documentId}",
                    json=payload,
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully updated injection status for file {documentId}: {status}")
                    return response.json()
                else:
                    logger.error(f"Failed to update injection status. Status: {response.status_code}, Response: {response.text}")
                    return {"error": f"HTTP {response.status_code}", "message": response.text}
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout while updating injection status for file {documentId}")
            return {"error": "timeout", "message": "Request timed out"}
        except httpx.RequestError as e:
            logger.error(f"Request error while updating injection status for file {documentId}: {e}")
            return {"error": "request_error", "message": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error while updating injection status for file {documentId}: {e}")
            return {"error": "unexpected_error", "message": str(e)}
    
    async def get_injection_status(self, file_id: str) -> Dict[str, Any]:
        """
        Get the current injection status from NestJS API
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/api/injection-status/{file_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get injection status. Status: {response.status_code}, Response: {response.text}")
                    return {"error": f"HTTP {response.status_code}", "message": response.text}
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout while getting injection status for file {file_id}")
            return {"error": "timeout", "message": "Request timed out"}
        except httpx.RequestError as e:
            logger.error(f"Request error while getting injection status for file {file_id}: {e}")
            return {"error": "request_error", "message": str(e)}
        except Exception as e:
            logger.error(f"Unexpected error while getting injection status for file {file_id}: {e}")
            return {"error": "unexpected_error", "message": str(e)}
    
    def _get_timestamp(self) -> str:
        """
        Get current timestamp in ISO format
        """
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"
