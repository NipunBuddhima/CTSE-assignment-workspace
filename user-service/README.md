# User Service - Microservice

A secure, production-ready User Management microservice with authentication, registration, and profile management capabilities.

## Overview

The User Service provides:
- **User Registration** - New user registration with email validation
- **Authentication** - JWT-based login and session management
- **Profile Management** - View and update user profiles
- **Password Management** - Change password functionality
- **Email Verification** - Email validation and verification
- **Account Management** - Account deactivation and status management
- **Inter-Service Communication** - REST APIs for other microservices to query user information

## Features

✅ JWT Token-based Authentication
✅ Password Hashing with Bcrypt
✅ Input Validation with Express Validator
✅ MongoDB Integration
✅ CORS Enabled
✅ Error Handling
✅ Docker Support
✅ Environment Configuration
✅ API Documentation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + Bcrypt
- **Validation**: Express Validator
- **Containerization**: Docker

## Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm or yarn

### Local Setup

1. Clone the repository
```bash
git clone <repository-url>
cd user-service
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
```

4. Update .env with your configuration
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/user-service
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Run the service
```bash
npm run dev
```

The service will be available at `http://localhost:3001`

## Docker Setup

### Build Docker Image
```bash
docker build -t user-service:latest .
```

### Run Docker Container
```bash
docker run -d \
  -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/user-service \
  -e JWT_SECRET=your-secret-key \
  --name user-service \
  user-service:latest
```

### Using Docker Compose
```bash
docker-compose up -d
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Health Check
```
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "User Service is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Secure@123",
  "confirmPassword": "Secure@123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Secure@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Change Password
**Endpoint:** `POST /auth/change-password`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "Secure@123",
  "newPassword": "NewSecure@456",
  "confirmPassword": "NewSecure@456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## User Profile Endpoints

### 1. Get User Profile
**Endpoint:** `GET /users/profile`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "profilePhoto": "https://example.com/photo.jpg",
    "isEmailVerified": true,
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2. Update User Profile
**Endpoint:** `PUT /users/profile`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "profilePhoto": "https://example.com/new-photo.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "profilePhoto": "https://example.com/new-photo.jpg",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

### 3. Verify Email
**Endpoint:** `POST /users/verify-email`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

---

### 4. Deactivate Account
**Endpoint:** `POST /users/deactivate`

**Authentication:** Required (Bearer Token)

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deactivated successfully",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "isActive": false
  }
}
```

---

## Inter-Service Communication Endpoints

### 1. Get User by ID
**Endpoint:** `GET /users/id/:userId`

**Description:** For other microservices to fetch user details by userId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-10T10:30:00.000Z"
  }
}
```

### 2. Get User by Email
**Endpoint:** `GET /users/email/:email`

**Description:** For other microservices to fetch user details by email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2024-01-10T10:30:00.000Z"
  }
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

---

## Security Considerations

### Implemented Security Measures
✅ Password hashing with bcrypt (10 salt rounds)
✅ JWT token-based authentication
✅ Input validation with express-validator
✅ CORS enabled with configurable origins
✅ Environment-based secrets management
✅ Password never returned in API responses
✅ Email uniqueness constraint
✅ Password confirmation validation

### Best Practices
- Always use HTTPS in production
- Rotate JWT_SECRET regularly
- Use strong passwords (minimum 6 characters enforced)
- Implement rate limiting (recommended)
- Enable CORS only for trusted origins
- Validate all user inputs
- Use environment variables for sensitive data

---

## Development

### Running in Development Mode
```bash
npm run dev
```
Runs with nodemon for auto-reload on file changes.

### Running Tests
```bash
npm test
```

### Code Structure
```
src/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   └── User.js              # User schema and model
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # Profile management logic
├── routes/
│   ├── auth.js              # Auth endpoints
│   └── user.js              # User endpoints
├── middleware/
│   └── auth.js              # JWT verification middleware
└── server.js                # Main application entry point
```

---

## Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/user-service

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Integration with Other Services

### Example: Order Service calling User Service
```javascript
const axios = require('axios');

// Verify user exists
const response = await axios.get(
  'http://user-service:3001/api/users/id/550e8400-e29b-41d4-a716-446655440000'
);

if (response.data.success) {
  const user = response.data.data;
  console.log(`User ${user.firstName} ${user.lastName} found`);
}
```

---

## Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to any servers in your MongoDB connection string
```
- **Solution**: Ensure MongoDB is running and MONGODB_URI is correct

### Invalid Token Error
```
Error: Token is invalid or expired
```
- **Solution**: Token has expired (7 days). User needs to login again.

### CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
- **Solution**: Update CORS configuration in `server.js` to include your frontend URL

---

## Deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV to 'production'
- [ ] Use production MongoDB connection string
- [ ] Set appropriate CORS origins
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Run security audit: `npm audit`
- [ ] Test all endpoints
- [ ] Set up automated backups

---

## License

ISC

## Author

CTSE Assignment - E-Commerce Microservices
