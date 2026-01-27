# 🔐 Squeezy Backend - Authentication & Security API

A robust, production-ready Node.js backend API built with Express.js and TypeScript, providing comprehensive authentication, multi-factor authentication (MFA), and session management features.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Development](#development)
- [Benefits](#benefits)

## 🎯 Overview

Squeezy Backend is a secure authentication system designed for modern web applications. It provides a complete authentication solution with email verification, password reset, multi-factor authentication (2FA), and advanced session management. Built with TypeScript for type safety and Express.js for high performance.

## ✨ Key Features

### 🔑 Authentication
- **User Registration** - Secure user registration with email verification
- **Login System** - JWT-based authentication with access and refresh tokens
- **Email Verification** - Automatic email verification on registration
- **Password Reset** - Secure password reset flow with time-limited verification codes
- **Logout** - Session-based logout with token invalidation

### 🛡️ Multi-Factor Authentication (MFA)
- **2FA Setup** - QR code generation for authenticator apps (Google Authenticator, Authy, etc.)
- **MFA Verification** - TOTP-based verification for login
- **MFA Management** - Enable/disable 2FA with secure secret management
- **Login Integration** - Seamless 2FA flow during login

### 📱 Session Management
- **Multiple Sessions** - Support for multiple active sessions per user
- **Session Tracking** - Track sessions with user agent information
- **Session Expiration** - Automatic session expiration (30 days default)
- **Session Revocation** - Users can delete individual sessions
- **Current Session Detection** - Identify and mark the current active session

### 🔒 Security Features
- **Password Hashing** - Bcrypt-based password encryption
- **JWT Tokens** - Secure token-based authentication
- **Refresh Tokens** - Long-lived refresh tokens with rotation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Configuration** - Configurable cross-origin resource sharing
- **Input Validation** - Zod schema validation for all inputs
- **Error Handling** - Comprehensive error handling with custom error codes

### 📧 Email Services
- **Email Templates** - Pre-built templates for verification and password reset
- **Resend Integration** - Modern email delivery via Resend API
- **Email Verification Links** - Time-limited verification codes

## 🛠️ Technologies Used

### Core Framework
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Typed superset of JavaScript for better code quality

### Database
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - MongoDB object modeling for Node.js

### Authentication & Security
- **Passport.js** - Authentication middleware
- **Passport-JWT** - JWT strategy for Passport
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing library
- **speakeasy** - TOTP (Time-based One-Time Password) for 2FA
- **qrcode** - QR code generation for 2FA setup

### Validation & Utilities
- **Zod** - TypeScript-first schema validation
- **uuid** - Unique identifier generation
- **date-fns-tz** - Date manipulation and timezone handling

### Email Services
- **Resend** - Modern email API for transactional emails
- **Nodemailer** - Email sending library (fallback)

### Development Tools
- **TypeScript** - Type-safe development
- **ts-node** - TypeScript execution for Node.js
- **Nodemon** - Auto-restart during development
- **Biome** - Fast formatter and linter
- **Husky** - Git hooks for code quality

### Additional Libraries
- **cookie-parser** - Cookie parsing middleware
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting middleware
- **winston** - Logging library

## 📁 Project Structure

```
backend/
├── src/
│   ├── @types/              # TypeScript type definitions
│   │   └── index.d.ts        # Express Request/User type augmentations
│   ├── common/
│   │   ├── enums/            # Enum definitions
│   │   ├── interface/        # TypeScript interfaces
│   │   ├── strategies/       # Passport authentication strategies
│   │   ├── utils/            # Utility functions
│   │   └── validators/       # Zod validation schemas
│   ├── configs/              # Configuration files
│   │   ├── env.config.ts     # Environment variables
│   │   └── http.config.ts    # HTTP status codes
│   ├── database/
│   │   ├── database.ts       # MongoDB connection
│   │   └── models/           # Mongoose models
│   │       ├── user.model.ts
│   │       ├── session.model.ts
│   │       └── verification.model.ts
│   ├── mailers/              # Email service
│   │   ├── mailer.ts         # Email sending logic
│   │   ├── resendClient.ts   # Resend API client
│   │   └── template.ts       # Email templates
│   ├── middlewares/          # Express middlewares
│   │   ├── asyncHandler.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── notFound.middleware.ts
│   │   └── passport.ts       # Passport configuration
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.module.ts
│   │   ├── mfa/              # Multi-factor authentication
│   │   │   ├── mfa.controller.ts
│   │   │   ├── mfa.service.ts
│   │   │   ├── mfa.route.ts
│   │   │   └── mfa.module.ts
│   │   ├── session/          # Session management
│   │   │   ├── session.controller.ts
│   │   │   ├── session.service.ts
│   │   │   ├── session.route.ts
│   │   │   └── session.module.ts
│   │   └── user/             # User management
│   │       ├── user.service.ts
│   │       └── user.module.ts
│   └── index.ts              # Application entry point
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── biome.json                # Biome configuration
├── nodemon.json              # Nodemon configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **MongoDB** database (local or cloud instance)
- **Resend API Key** (for email services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration (see [Environment Variables](#environment-variables))

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=7000
NODE_ENV=development

# API Base Path
BASE_PATH="/api/v1"

# Frontend Origin (for CORS)
FRONTEND_ORIGIN="http://localhost:3000"

# MongoDB Connection
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/database"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=30d

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key
MAILER_SENDER="onboarding@resend.dev"
```

## 📡 API Endpoints

### Base URL
```
http://localhost:7000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| POST | `/auth/verify/email` | Verify email address | ❌ |
| POST | `/auth/password/forgot` | Request password reset | ❌ |
| POST | `/auth/password/reset` | Reset password | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |
| GET | `/auth/refresh` | Refresh access token | ❌ |

### Multi-Factor Authentication (MFA)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/mfa/setup` | Generate QR code for 2FA setup | ✅ |
| POST | `/mfa/verify` | Verify and enable 2FA | ✅ |
| PUT | `/mfa/revoke` | Disable 2FA | ✅ |
| POST | `/mfa/verify-login` | Verify 2FA during login | ❌ |

### Session Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/session/all` | Get all user sessions | ✅ |
| GET | `/session` | Get current session | ✅ |
| DELETE | `/session/:id` | Delete a specific session | ✅ |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API welcome message |
| GET | `/health` | Server health status |

## 🔐 Security Features

### Password Security
- **Bcrypt Hashing** - Passwords are hashed using bcrypt with salt rounds
- **Password Validation** - Strong password requirements enforced
- **Password Reset** - Secure reset flow with time-limited codes

### Token Security
- **JWT Tokens** - Secure, stateless authentication tokens
- **Refresh Tokens** - Long-lived tokens stored securely
- **Token Rotation** - Automatic refresh token rotation
- **Token Expiration** - Configurable token expiration times

### Session Security
- **Session Tracking** - Track all active sessions per user
- **Session Expiration** - Automatic expiration after 30 days
- **Session Revocation** - Users can revoke individual sessions
- **User Agent Tracking** - Track device/browser information

### API Security
- **CORS Protection** - Configurable cross-origin resource sharing
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Zod schema validation for all inputs
- **Error Handling** - Secure error messages without exposing internals

### 2FA Security
- **TOTP Algorithm** - Time-based One-Time Password standard
- **QR Code Generation** - Secure QR codes for authenticator apps
- **Secret Management** - Encrypted storage of 2FA secrets
- **Backup Codes** - Optional backup codes for account recovery

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server

# Code Quality
npm run format       # Format code with Biome
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run check        # Run all checks (format + lint)
```

### Code Style

This project uses **Biome** for code formatting and linting. The configuration is in `biome.json`.

### Git Hooks

**Husky** is configured to run pre-commit hooks, ensuring code quality before commits.

## 🎁 Benefits

### For Developers
- ✅ **Type Safety** - TypeScript provides compile-time error checking
- ✅ **Modular Architecture** - Clean separation of concerns
- ✅ **Scalable Structure** - Easy to add new features
- ✅ **Comprehensive Error Handling** - Custom error classes and codes
- ✅ **Developer Experience** - Hot reload, linting, and formatting

### For Users
- ✅ **Secure Authentication** - Industry-standard security practices
- ✅ **Multi-Factor Authentication** - Additional layer of security
- ✅ **Session Management** - Control over active sessions
- ✅ **Email Verification** - Ensures valid email addresses
- ✅ **Password Recovery** - Secure password reset flow

### For Business
- ✅ **Production Ready** - Built with best practices
- ✅ **Scalable** - Can handle growing user base
- ✅ **Maintainable** - Clean code structure
- ✅ **Secure** - Multiple layers of security
- ✅ **Modern Stack** - Uses latest technologies

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@example.com or create an issue in the repository.

---

**Built with ❤️ using Express.js and TypeScript**
