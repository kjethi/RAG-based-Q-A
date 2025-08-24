# Document Management System Backend

A robust NestJS-based backend application for managing documents, user authentication, and Q&A functionality with AI-powered document processing.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Document Management**: Upload, store, and manage documents with metadata
- **AI-Powered Q&A**: Ask questions about uploaded documents using AI
- **S3 Integration**: Secure file storage using AWS S3
- **Queue Processing**: Asynchronous document processing using AWS SQS
- **RESTful API**: Well-structured API endpoints with Swagger documentation
- **Database**: PostgreSQL with TypeORM for data persistence
- **Security**: Input validation, CORS, and IP whitelisting

## 🛠️ Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **File Storage**: AWS S3
- **Message Queue**: AWS SQS
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 📋 Prerequisites

- Node.js (v20 or higher)
- PostgreSQL database
- AWS account with S3 and SQS access
- Python 3.8+ (for RAG backend integration)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   DB_SYNC=true
   DB_LOGGING=true
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=your_s3_bucket_name
   AWS_SQS_QUEUE_URL=your_sqs_queue_url
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb your_database_name
   
   # Run migrations (if using TypeORM migrations)
   npm run migration:run
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e

# Test in watch mode
npm run test:watch
```

## 📚 API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/api
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `PUT /users/:id/status` - Update user status

#### Documents
- `POST /documents` - Upload document
- `GET /documents` - Get documents list
- `GET /documents/:id` - Get document by ID
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

#### Q&A
- `POST /qa/ask` - Ask question about documents

#### S3 Upload
- `POST /s3-upload/presigned-url` - Get presigned URL for S3 upload

## 🏗️ Project Structure

```
src/
├── app/                    # Main application module
├── auth/                   # Authentication module
├── users/                  # User management
├── document/               # Document management
├── qa/                     # Q&A functionality
├── s3Upload/               # S3 file upload
├── service/                # Service authentication
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── guards/             # Authentication guards
│   ├── interceptors/       # Response interceptors
│   └── enums/              # Enumerations
└── config/                 # Configuration files
```

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based access control:

- **User Roles**: Admin, User
- **JWT Strategy**: Stateless authentication
- **Role Guards**: Protect routes based on user roles
- **IP Whitelisting**: Additional security for service endpoints

## 📁 Document Processing

Documents are processed asynchronously:
1. User uploads document via S3
2. Document metadata is stored in database
3. Document is queued for processing
4. RAG backend processes and indexes the document
5. Document becomes searchable for Q&A

## 🚀 Deployment

### Docker Deployment
```bash
# Build the application
npm run build

# Build Docker image
docker build -t document-management-backend .

# Run container
docker run -p 3000:3000 document-management-backend
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Disable `DB_SYNC` for production
- Use strong JWT secrets
- Configure proper CORS origins

## 🔧 Configuration

### Database Configuration
- **TypeORM**: Configured for PostgreSQL
- **Synchronization**: Auto-sync in development, manual in production
- **Logging**: Configurable database query logging

### AWS Services
- **S3**: Document storage with presigned URLs
- **SQS**: Asynchronous document processing queue
- **Region**: Configurable AWS region

## 📝 Code Quality

- **ESLint**: Code linting with custom configuration
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Validation**: Class-validator for DTOs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api`
- Review the test files for usage examples
- Check the configuration files for setup options

## 🔄 Related Services

This backend integrates with:
- **RAG Backend**: Python service for document processing and AI Q&A
- **Frontend**: React-based user interface
- **AWS Services**: S3, SQS for file storage and processing
