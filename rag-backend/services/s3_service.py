import boto3
import tempfile
import os
from botocore.exceptions import ClientError
from config import settings
import logging

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket_name = settings.AWS_S3_BUCKET
    
    def download_file(self, file_key: str) -> str:
        """
        Download a file from S3 and return the local file path
        """
        try:
            # Create a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file_key)[1])
            temp_file_path = temp_file.name
            temp_file.close()
            
            # Download the file from S3
            self.s3_client.download_file(self.bucket_name, file_key, temp_file_path)
            logger.info(f"Successfully downloaded {file_key} from S3 to {temp_file_path}")
            
            return temp_file_path
            
        except ClientError as e:
            logger.error(f"Error downloading file {file_key} from S3: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error downloading file {file_key}: {e}")
            raise
    
    def delete_local_file(self, file_path: str):
        """
        Delete a local temporary file
        """
        try:
            if os.path.exists(file_path):
                os.unlink(file_path)
                logger.info(f"Deleted temporary file: {file_path}")
        except Exception as e:
            logger.error(f"Error deleting temporary file {file_path}: {e}")