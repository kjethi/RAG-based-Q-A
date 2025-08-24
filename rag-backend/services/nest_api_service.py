import httpx
import time
from typing import Optional, Dict, Any
from config import settings

class NestAPIService:
    def __init__(self):
        self.base_url = settings.NEST_API_BASE_URL
        self.service_id = settings.NEST_SERVICE_ID
        self.service_secret = settings.NEST_SERVICE_SECRET
        self._service_token: Optional[str] = None
        self._token_expires_at: Optional[float] = None

    async def _get_service_token(self) -> str:
        """Get or refresh service authentication token"""
        current_time = time.time()
        
        # Check if token is still valid (with 5 minute buffer)
        if (self._service_token and self._token_expires_at and 
            current_time < self._token_expires_at - 300):
            return self._service_token
        
        try:
            # Use httpx for service authentication
            import httpx
            async with httpx.AsyncClient() as client:
                auth_response = await client.post(
                    f"{self.base_url}/service-auth/authenticate",
                    json={
                        "serviceId": self.service_id,
                        "serviceSecret": self.service_secret
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10.0
                )
                
                if auth_response.status_code == 200:
                    auth_data = auth_response.json()
                    self._service_token = auth_data["data"]["accessToken"]
                    self._token_expires_at = current_time + auth_data["data"]["expiresIn"]
                    return self._service_token
                else:
                    raise Exception(f"Service authentication failed: {auth_response.status_code}")
                
        except Exception as e:
            print(f"Failed to authenticate service: {e}")
            raise

    async def _make_authenticated_request(self, method: str, endpoint: str, **kwargs) -> httpx.Response:
        """Make an authenticated request to NestJS API"""
        token = await self._get_service_token()
       
        headers = kwargs.get('headers', {})
        headers['Authorization'] = f'Bearer {token}'
        headers['Content-Type'] = 'application/json'
        kwargs['headers'] = headers
        
        url = f"{self.base_url}{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(method, url, **kwargs)
                return response
        except Exception as e:
            print(f"Request failed: {e}")
            raise

    async def update_injection_status(self, documentId: str = None, status: str = None, message: str = None) -> Dict[str, Any]:
        """Update document injection status"""
        try:
            if not documentId:
                raise ValueError("documentId must be provided")
            
            payload = {
                "documentId": documentId,
                "status": status
            }
            if message:
                payload["message"] = message
            
            response = await self._make_authenticated_request(
                'POST',
                '/public-service/update-injection-status',
                json=payload
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Failed to update injection status. Status: {response.status_code}, Response: {response.text}")
                return {"error": f"HTTP {response.status_code}: {response.text}"}
                
        except Exception as e:
            print(f"Error updating injection status: {e}")
            return {"error": str(e)}