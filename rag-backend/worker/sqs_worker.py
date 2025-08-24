import boto3
import json
import logging
import asyncio
import time
from botocore.exceptions import ClientError
from config import settings
from services.document_processor import DocumentProcessor
from services.nest_api_service import NestAPIService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class SQSWorker:
    def __init__(self):
        self.sqs_client = boto3.client(
            "sqs",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )
        self.queue_url = settings.AWS_SQS_QUEUE_URL
        self.document_processor = DocumentProcessor()
        self.nest_api_service = NestAPIService()
        self.running = False

    async def start(self):
        """
        Start the SQS worker (async)
        """
        logger.info("Starting SQS worker...")
        self.running = True

        try:
            while self.running:
                try:
                    # Receive messages from SQS (sync boto3 call, so run in thread executor)
                    messages = await asyncio.to_thread(self._receive_messages)

                    if messages:
                        for message in messages:
                            try:
                                # ✅ Await the async message processor
                                await self._process_message(message)
                            except Exception as e:
                                logger.error(
                                    f"Error processing message {message.get('MessageId')}: {e}"
                                )
                    else:
                        await asyncio.sleep(10)

                except Exception as e:
                    logger.error(f"Error in SQS worker main loop: {e}")
                    await asyncio.sleep(30)

        except asyncio.CancelledError:
            logger.info("Worker cancelled, shutting down...")
        finally:
            await self.stop()

    async def stop(self):
        """
        Stop the SQS worker
        """
        logger.info("Stopping SQS worker...")
        self.running = False

    def _receive_messages(self, max_messages: int = 10) -> list:
        """
        Receive messages from SQS queue (sync boto3)
        """
        try:
            response = self.sqs_client.receive_message(
                QueueUrl=self.queue_url,
                MaxNumberOfMessages=max_messages,
                WaitTimeSeconds=20,  # Long polling
                AttributeNames=["All"],
                MessageAttributeNames=["All"],
            )
            return response.get("Messages", [])
        except ClientError as e:
            logger.error(f"Error receiving messages from SQS: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error receiving messages: {e}")
            return []

    async def _process_message(self, message: dict):
        """
        Process a single SQS message
        """
        try:
            body = json.loads(message["Body"])
            logger.info(f"Processing message: {body}")

            file_key = body.get("key")
            documentId = body.get("documentId")

            if not file_key or not documentId:
                logger.error("Invalid message format: missing file_key or documentId")
                return

            sqs_attempt = int(message.get("Attributes", {}).get("ApproximateReceiveCount", 1))
            max_sqs_attempts = settings.MAX_SQS_ATTEMPTS

            logger.info(f"Processing SQS message attempt {sqs_attempt}/{max_sqs_attempts}")

            result = await self.document_processor.process_document(
                file_key,
                documentId,
                sqs_attempt=sqs_attempt,
                max_sqs_attempts=max_sqs_attempts,
            )

            logger.info(f"processing message for file and result: {result}")
            if result.get("status") == "failed":
                logger.error(f"Document processing failed for file: {file_key}")
                if sqs_attempt >= max_sqs_attempts:
                    await self.nest_api_service.update_injection_status(
                        documentId,
                        "failed",
                        f"Processing failed after {sqs_attempt} attempts",
                    )
                    await asyncio.to_thread(self._delete_message, message)
            else:
                await asyncio.to_thread(self._delete_message, message)

            logger.info(f"Finished processing message for file: {file_key}")

        except json.JSONDecodeError as e:
            logger.error(f"Error parsing message body: {e}")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            raise

    def _delete_message(self, message: dict):
        """
        Delete a processed message from the SQS queue (sync boto3)
        """
        try:
            self.sqs_client.delete_message(
                QueueUrl=self.queue_url, ReceiptHandle=message["ReceiptHandle"]
            )
            logger.info(f"Deleted message {message.get('MessageId')} from SQS")
        except ClientError as e:
            logger.error(f"Error deleting message {message.get('MessageId')}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error deleting message {message.get('MessageId')}: {e}")


def main():
    worker = SQSWorker()
    try:
        asyncio.run(worker.start())
    except Exception as e:
        logger.error(f"Fatal error in SQS worker: {e}")
        raise


if __name__ == "__main__":
    main()
