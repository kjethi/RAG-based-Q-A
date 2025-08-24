#!/usr/bin/env python3
"""
Test script for NestJS service authentication
"""
import asyncio
import os
from services.nest_api_service import NestAPIService

async def test_service_auth():
    """Test the service authentication flow"""
    print("Testing NestJS service authentication...")
    
    # Initialize the service
    service = NestAPIService()
    
    try:
        # Test updating injection status
        print("\n1. Testing update_injection_status...")
        result = await service.update_injection_status(
            documentId="test-doc-123",
            status="testing",
            message="Testing service authentication"
        )
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Error during testing: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Environment variables:")
    print(f"SERVICE_ID: {os.environ.get('NEST_SERVICE_ID')}")
    print(f"SERVICE_SECRET: {os.environ.get('NEST_SERVICE_SECRET')}")
    print(f"NEST_API_BASE_URL: {os.environ.get('NEST_API_BASE_URL')}")
    
    # Run the test
    asyncio.run(test_service_auth())
