#!/bin/bash

echo "Starting RAG Backend System..."

# Function to cleanup background processes
cleanup() {
    echo "Shutting down..."
    kill $FASTAPI_PID $WORKER_PID 2>/dev/null
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start FastAPI service in background
echo "Starting FastAPI service..."
python main.py &
FASTAPI_PID=$!

# Wait a moment for FastAPI to start
sleep 3

# Start SQS worker in background
echo "Starting SQS worker..."
python start_worker.py &
WORKER_PID=$!

echo "Both services started!"
echo "FastAPI service PID: $FASTAPI_PID"
echo "SQS worker PID: $WORKER_PID"
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait
