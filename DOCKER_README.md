# 🐳 Docker Setup for RAG Document Management System

This document explains how to run the entire RAG Document Management System using Docker and Docker Compose.

## 🚀 Quick Start

### 1. Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 8GB RAM available
- 20GB free disk space

### 2. Environment Setup
```bash
# Create .env file for each app (frontend , backend , rag-backend)
# each app has env.template so you can just copy paste and rename it to .env
cp env.template .env

# Edit the .env file with your configuration
nano .env
```

### 3. Start All Services
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Swagger Docs**: http://localhost/docs
- **RAG Backend**: http://localhost/rag
- **Ollama**: http://localhost/ollama

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx Proxy   │    │   Backend      │
│   (React)       │◄──►│   (Port 80)     │◄──►│   (NestJS)     │
│   Port 5173     │    │                 │    │   Port 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   RAG Backend   │    │   PostgreSQL    │
                       │   (Python)      │    │   Port 5432     │
                       │   Port 8000     │    └─────────────────┘
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Ollama        │
                       │   (LLM)         │
                       │   Port 11434    │
                       └─────────────────┘
```

## 📋 Services Description

### 🎯 Frontend (React)
- **Port**: 80 (via Nginx)
- **Technology**: React 19 + TypeScript + Vite
- **Features**: User interface, authentication, document management
- **Health Check**: `/health` endpoint

### 🔧 Backend (NestJS)
- **Port**: 3000
- **Technology**: NestJS + TypeScript + PostgreSQL
- **Features**: REST API, authentication, user management
- **Health Check**: `/health` endpoint

### 🤖 RAG Backend (Python)
- **Port**: 8000
- **Technology**: FastAPI + Python + ChromaDB
- **Features**: Document processing, AI Q&A, vector search
- **Health Check**: `/health` endpoint

### 🗄️ Database (PostgreSQL)
- **Port**: 5432
- **Version**: 15-alpine
- **Features**: Data persistence, user management
- **Health Check**: Database connectivity

### 🧠 Ollama (LLM)
- **Port**: 11434
- **Technology**: Local LLM service
- **Features**: Text generation, AI processing
- **Health Check**: API availability



### 🌐 Nginx (Reverse Proxy)
- **Port**: 80, 443
- **Features**: Load balancing, SSL termination, rate limiting
- **Health Check**: `/health` endpoint

## ⚙️ Configuration

### Environment Variables
The system uses a centralized `.env` file for configuration:

```bash
# Required AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket
AWS_SQS_QUEUE_URL=your_queue_url

# Database Configuration
DB_HOST=postgres
DB_USERNAME=rag_user
DB_PASSWORD=rag_password

# JWT Configuration
JWT_SECRET=your_secret_key

# RAG Configuration
OLLAMA_MODEL=llama2
NEST_API_KEY=your_api_key
```

### Service Dependencies
Services start in the correct order with health checks:
1. **PostgreSQL** → **Backend**
2. **Ollama** → **RAG Backend**
3. **Backend** → **Frontend** → **Nginx**

## 🚀 Development vs Production

### Development Mode
```bash
# Enable development features
NODE_ENV=development
DB_SYNC=true
DB_LOGGING=true

# Start with rebuild
docker-compose up --build
```

### Production Mode
```bash
# Production settings
NODE_ENV=production
DB_SYNC=false
DB_LOGGING=false

# Start with restart policy
docker-compose up -d
```

## 🛠️ Management Commands

### Service Management
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View service logs
docker-compose logs -f backend

# Check service status
docker-compose ps
```

### Database Management
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U rag_user -d rag_database

# Backup database
docker-compose exec postgres pg_dump -U rag_user rag_database > backup.sql

# Restore database
docker-compose exec -T postgres psql -U rag_user -d rag_database < backup.sql
```

### Container Management
```bash
# Execute commands in containers
docker-compose exec backend npm run test
docker-compose exec rag-backend python -m pytest

# View container resources
docker stats

# Clean up unused resources
docker system prune -a
```

## 🔍 Monitoring & Debugging

### Health Checks
All services include health check endpoints:
- **Frontend**: `GET /health`
- **Backend**: `GET /health`
- **RAG Backend**: `GET /health`
- **Nginx**: `GET /health`

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f rag-backend

# Follow logs in real-time
docker-compose logs -f --tail=100
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df

# Analyze container performance
docker-compose exec backend npm run start:debug
```

## 🔒 Security Features

### Network Isolation
- All services run in isolated `rag_network`
- Internal communication via service names
- External access only through Nginx proxy

### Rate Limiting
- API endpoints: 10 requests/second
- Login endpoints: 5 requests/second
- Configurable via Nginx configuration

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy headers

## 📊 Scaling & Performance

### Resource Allocation
```yaml
# Add to docker-compose.yml for production
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'
```

### Load Balancing
- Nginx handles load balancing
- Multiple backend instances supported
- Session management via JWT tokens

### Caching Strategy
- Static assets cached for 1 year
- HTML files: no cache
- API responses: configurable caching

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service_name

# Verify environment variables
docker-compose config

# Check port conflicts
netstat -tulpn | grep :3000
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U rag_user

# Verify credentials
docker-compose exec postgres psql -U rag_user -d rag_database -c "\l"
```

#### Memory Issues
```bash
# Check available memory
free -h

# Increase Docker memory limit
# Edit Docker Desktop settings
```

### Debug Mode
```bash
# Enable debug logging
docker-compose exec backend npm run start:debug

# Check service health
curl http://localhost/health
curl http://localhost/api/health
curl http://localhost/rag/health
```

## 🔄 Updates & Maintenance

### Updating Services
```bash
# Pull latest images
docker-compose pull

# Rebuild services
docker-compose up --build -d

# Update specific service
docker-compose pull backend
docker-compose up --build -d backend
```

### Backup & Recovery
```bash
# Backup volumes
docker run --rm -v rag_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v rag_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 📚 Additional Resources

### Documentation
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Support
- Check service logs for errors
- Verify environment configuration
- Ensure sufficient system resources
- Check network connectivity between services

## 🎯 Next Steps

1. **Customize Configuration**: Update `.env` file with your settings
2. **SSL Setup**: Configure SSL certificates for HTTPS
3. **Monitoring**: Add Prometheus/Grafana for metrics
4. **Backup**: Set up automated database backups
5. **CI/CD**: Integrate with your deployment pipeline

---

**Happy Dockerizing! 🐳✨**
