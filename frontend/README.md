# Document Management System Frontend

A modern React-based frontend application for managing documents, user authentication, and AI-powered Q&A functionality. Built with React 19, TypeScript, and Vite for optimal performance and developer experience.

## 🚀 Features

- **User Authentication**: Secure login/signup with JWT token management
- **Role-Based Access Control**: Admin and user role management
- **Document Management**: Upload, view, and manage documents
- **AI Q&A Interface**: Ask questions about uploaded documents
- **Document Ingestion**: Streamlined document upload and processing
- **User Management**: Admin panel for user administration
- **Responsive Design**: Mobile-friendly interface with Bootstrap
- **Real-time Notifications**: Toast notifications for user feedback
- **Protected Routes**: Secure navigation with authentication guards

## 🛠️ Tech Stack

- **Framework**: React 19.x with TypeScript
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM 6.x
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **UI Framework**: Bootstrap 5.x
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast & React Toastify
- **Authentication**: JWT with cookie management
- **Code Quality**: ESLint, TypeScript

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm or yarn package manager
- Backend API running (NestJS backend)
- Modern web browser with ES6+ support

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3001
   
   # Application Configuration
   VITE_APP_NAME=Document Management System
   VITE_APP_VERSION=1.0.0
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
# or
yarn build
```

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

## 🧪 Code Quality

### Linting
```bash
npm run lint
# or
yarn lint
```

## 🏗️ Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── auth/               # Authentication components
│   │   ├── AuthLayout.tsx  # Authentication page layout
│   │   ├── Login.tsx       # Login form
│   │   ├── SignUp.tsx      # Registration form
│   │   ├── Logout.tsx      # Logout component
│   │   ├── PrivateRoute.tsx # Protected route wrapper
│   │   └── PublicRoute.tsx  # Public route wrapper
│   ├── layout/             # Layout components
│   │   └── AppLayout.tsx   # Main application layout
│   ├── ui/                 # UI components
│   └── AuthProvider.tsx    # Authentication context provider
├── pages/                  # Page components
│   ├── admin/              # Admin pages
│   │   └── UserManagement.tsx
│   ├── documents/          # Document management
│   │   └── Documents.tsx
│   ├── ingestion/          # Document upload
│   │   └── Ingestion.tsx
│   └── qa/                 # Q&A interface
│       └── QA.tsx
├── services/               # API services
│   ├── api.ts             # Base API configuration
│   ├── auth.ts            # Authentication service
│   ├── qa.ts              # Q&A service
│   ├── s3Upload.ts        # File upload service
│   └── user.ts            # User management service
├── classes/                # TypeScript classes
│   ├── MetaData.ts        # Metadata class
│   └── User.ts            # User class
├── utils/                  # Utility functions
│   └── cookiesHelper.ts   # Cookie management
├── styles/                 # Global styles
├── assets/                 # Static assets
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
└── authHook.ts            # Custom authentication hook
```

## 🔐 Authentication System

### Features
- **JWT Token Management**: Secure token storage in cookies
- **Automatic Token Refresh**: Handles expired tokens gracefully
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent authentication state

### Authentication Flow
1. User submits login/signup credentials
2. Backend validates and returns JWT token
3. Token stored in secure HTTP-only cookies
4. Automatic token inclusion in API requests
5. Token refresh on 401 responses
6. Automatic logout on authentication failure

## 📱 Pages & Features

### Authentication Pages
- **Login**: User authentication with email/password
- **SignUp**: New user registration
- **Logout**: Secure session termination

### Main Application Pages
- **Documents**: View and manage uploaded documents
- **Ingestion**: Upload new documents for processing
- **Q&A**: Ask questions about documents using AI
- **User Management**: Admin panel for user administration

## 🔌 API Integration

### Base Configuration
- **Base URL**: Configurable via environment variables
- **Interceptors**: Automatic token management
- **Error Handling**: Graceful error handling with retry logic
- **Request/Response**: Type-safe API calls

### Service Modules
- **Auth Service**: Authentication endpoints
- **Document Service**: Document management
- **Q&A Service**: AI question answering
- **S3 Upload Service**: File upload handling
- **User Service**: User management

## 🎨 UI Components

### Design System
- **Bootstrap 5**: Modern, responsive design framework
- **Custom Components**: Tailored UI components
- **Responsive Layout**: Mobile-first approach
- **Toast Notifications**: User feedback system

### Layout Components
- **AuthLayout**: Clean authentication page design
- **AppLayout**: Main application navigation
- **Responsive Navigation**: Mobile-friendly menu

## 🚀 Development Features

### Hot Reload
- **Vite Dev Server**: Fast development experience
- **TypeScript Support**: Full type checking
- **ESLint Integration**: Code quality enforcement

### Build Optimization
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Lazy-loaded components
- **Asset Optimization**: Optimized bundle size

## 🔧 Configuration

### Vite Configuration
- **React Plugin**: JSX transformation
- **TypeScript**: Full TypeScript support
- **Development Server**: Hot module replacement

### Environment Variables
- **API Base URL**: Backend service endpoint
- **App Configuration**: Application metadata
- **Build-time Variables**: Vite-specific configuration

## 🧪 Testing

### Testing Setup
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **TypeScript**: Type-safe testing

### Running Tests
```bash
# Unit tests
npm test

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, Cloudflare
- **Container**: Docker with Nginx

### Environment Variables for Production
- Set `VITE_API_BASE_URL` to production backend
- Configure CORS settings on backend
- Set up proper domain configuration

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **HTTP-only Cookies**: XSS protection
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Form validation and sanitization
- **Route Protection**: Authentication guards

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **ES6+ Support**: Required for modern JavaScript features
- **Mobile Support**: Responsive design for all devices

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
- Check the component documentation
- Review the service implementations
- Check the authentication flow
- Verify API endpoint configuration

## 🔄 Related Services

This frontend integrates with:
- **Backend API**: NestJS backend service
- **RAG Backend**: Python AI processing service
- **AWS Services**: S3 for file storage, SQS for processing
- **Database**: PostgreSQL for data persistence