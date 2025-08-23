#!/usr/bin/env python3
"""
Script to start the SQS background worker
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from worker.sqs_worker import main

if __name__ == "__main__":
    print("Starting SQS Background Worker...")
    print("Press Ctrl+C to stop the worker")
    main()
