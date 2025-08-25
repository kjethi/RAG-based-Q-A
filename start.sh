#!/bin/bash

# RAG Document Management System - Docker Startup Script
# This script helps manage the Docker services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
    print_success "Docker Compose is available"
}

# Function to check environment file
check_env() {
    if [ ! -f .env ]; then
        print_warning "Environment file (.env) not found. Creating from template..."
        if [ -f env.template ]; then
            cp env.template .env
            print_warning "Please edit .env file with your configuration before starting services."
            print_warning "Press Enter to continue or Ctrl+C to abort..."
            read
        else
            print_error "env.template not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Function to start services
start_services() {
    print_status "Starting RAG Document Management System..."
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Services started successfully!"
    print_status "Waiting for services to be ready..."
    
    # Wait for services to be healthy
    sleep 10
    
    # Check service status
    docker-compose ps
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_success "Services restarted successfully!"
}

# Function to view logs
view_logs() {
    print_status "Showing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to check service status
check_status() {
    print_status "Service status:"
    docker-compose ps
    
    echo ""
    print_status "Health checks:"
    
    # Check frontend health
    if curl -s http://localhost/health > /dev/null 2>&1; then
        print_success "Frontend: Healthy"
    else
        print_error "Frontend: Unhealthy"
    fi
    
    # Check backend health
    if curl -s http://localhost/api/health > /dev/null 2>&1; then
        print_success "Backend: Healthy"
    else
        print_error "Backend: Unhealthy"
    fi
    
    # Check RAG backend health
    if curl -s http://localhost/rag/health > /dev/null 2>&1; then
        print_success "RAG Backend: Healthy"
    else
        print_error "RAG Backend: Unhealthy"
    fi
}

# Function to show help
show_help() {
    echo "RAG Document Management System - Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      View service logs"
    echo "  status    Check service status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start all services"
    echo "  $0 logs       # View logs"
    echo "  $0 status     # Check status"
}

# Main script logic
main() {
    case "${1:-start}" in
        "start")
            check_docker
            check_docker_compose
            check_env
            start_services
            check_status
            ;;
        "stop")
            check_docker
            check_docker_compose
            stop_services
            ;;
        "restart")
            check_docker
            check_docker_compose
            restart_services
            check_status
            ;;
        "logs")
            check_docker
            check_docker_compose
            view_logs
            ;;
        "status")
            check_docker
            check_docker_compose
            check_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
