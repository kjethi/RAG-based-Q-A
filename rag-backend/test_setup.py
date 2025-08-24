#!/usr/bin/env python3
"""
Test script to verify the RAG backend setup
"""

import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from config import settings
        print("✓ Config imported successfully")
    except Exception as e:
        print(f"✗ Config import failed: {e}")
        return False
    
    try:
        from services.s3_service import S3Service
        print("✓ S3 service imported successfully")
    except Exception as e:
        print(f"✗ S3 service import failed: {e}")
        return False
    
    try:
        from services.vector_db_service import VectorDBService
        print("✓ Vector DB service imported successfully")
    except Exception as e:
        print(f"✗ Vector DB service import failed: {e}")
        return False
    
    try:
        from services.llm_service import LLMService
        print("✓ LLM service imported successfully")
    except Exception as e:
        print(f"✗ LLM service import failed: {e}")
        return False
    
    try:
        from services.nest_api_service import NestAPIService
        print("✓ NestJS API service imported successfully")
    except Exception as e:
        print(f"✗ NestJS API service import failed: {e}")
        return False
    
    try:
        from services.document_processor import DocumentProcessor
        print("✓ Document processor imported successfully")
    except Exception as e:
        print(f"✗ Document processor import failed: {e}")
        return False
    
    try:
        from worker.sqs_worker import SQSWorker
        print("✓ SQS worker imported successfully")
    except Exception as e:
        print(f"✗ SQS worker import failed: {e}")
        return False
    
    return True

def test_service_initialization():
    """Test if services can be initialized"""
    print("\nTesting service initialization...")
    
    try:
        from services.vector_db_service import VectorDBService
        # This might fail if ChromaDB directory doesn't exist, which is expected
        try:
            vector_db = VectorDBService()
            print("✓ Vector DB service initialized successfully")
        except Exception as e:
            print(f"⚠ Vector DB service initialization failed (expected if ChromaDB not set up): {e}")
    except Exception as e:
        print(f"✗ Vector DB service initialization test failed: {e}")
        return False
    
    try:
        from services.llm_service import LLMService
        llm_service = LLMService()
        print("✓ LLM service initialized successfully")
    except Exception as e:
        print(f"✗ LLM service initialization failed: {e}")
        return False
    
    try:
        from services.nest_api_service import NestAPIService
        nest_service = NestAPIService()
        print("✓ NestJS API service initialized successfully")
    except Exception as e:
        print(f"✗ NestJS API service initialization failed: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("RAG Backend Setup Test")
    print("=" * 40)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please check your installation.")
        return False
    
    # Test service initialization
    if not test_service_initialization():
        print("\n❌ Service initialization tests failed.")
        return False
    
    print("\n✅ All tests passed! Your RAG backend is ready to use.")
    print("\nNext steps:")
    print("1. Set up your .env file with proper credentials")
    print("2. Start the FastAPI service: python main.py")
    print("3. Start the background worker: python start_worker.py")
    print("4. Or use the startup script: ./start.sh")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
