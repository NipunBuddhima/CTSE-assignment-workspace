# User Service - Quick Start Guide

## ✅ Implementation Complete

All user service features have been successfully implemented:
- ✅ User Registration with email validation
- ✅ User Login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Profile management (view, update, deactivate)
- ✅ Email verification
- ✅ Password change functionality
- ✅ Inter-service communication endpoints
- ✅ Input validation
- ✅ Error handling
- ✅ Docker support

## Project Structure

```
user-service/
├── src/  
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── models/
│   │   └── User.js                  # User schema & model (with password hashing)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, ChangePassword
│   │   └── userController.js        # Profile CRUD operations
│   ├── routes/
│   │   ├── auth.js                  # Auth endpoints
│   │   └── user.js                  # User endpoints
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   └── server.js                    # Main entry point
├── Dockerfile                       # Docker configuration
├── docker-compose.yml               # (Create for local testing)
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── .dockerignore                    # Docker ignore rules
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies
├── openapi.yaml                     # API documentation
└── README.md                        # Full API documentation
```

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally or remote
- npm

### 2. Install Dependencies (Already Done)
```bash
cd user-service
npm install
```

### 3. Environment Setup (Already Done)
`.env` file is configured with:
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/user-service
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 4. Start the Service
**Option A: Development Mode (with auto-reload)**
```bash
npm run dev
```

**Option B: Production Mode**
```bash
npm start
```

**Option C: Direct Node**
```bash
node src/server.js
```

### 5. Verify Service is Running
```bash
curl http://localhost:3001/health
```

## API Testing (Postman/cURL Examples)

### Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

**Response:**
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

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile (Protected)
```bash
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA"
    }
  }'
```

### Get User by ID (For Inter-Service Use)
```bash
curl http://localhost:3001/api/users/id/550e8400-e29b-41d4-a716-446655440000
```

### Get User by Email (For Inter-Service Use)
```bash
curl http://localhost:3001/api/users/email/john@example.com
```

## Docker Deployment

### Build Image
```bash
docker build -t user-service:latest .
```

### Run Container
```bash
docker run -d \
  -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/user-service \
  -e JWT_SECRET=your-secret-key \
  --name user-service \
  user-service:latest
```

### View Logs
```bash
docker logs -f user-service
```

## Features Implemented

### 1. Authentication (`/api/auth`)
- **POST /register** - User registration with validation
  - Validates email format
  - Hashes password with bcrypt
  - Generates JWT token
  - Returns user data + token

- **POST /login** - User authentication
  - Verifies credentials
  - Updates last login timestamp
  - Returns user data + token
  - Token expires in 7 days

- **POST /change-password** - Change password (protected)
  - Requires current password
  - Validates new password match
  - Updates password safely

### 2. Profile Management (`/api/users`)
- **GET /profile** - Get authenticated user's profile (protected)
  - Returns all user information
  - Excludes password field

- **PUT /profile** - Update profile (protected)
  - Update first name, last name
  - Update phone number
  - Update address (street, city, state, postal code, country)
  - Update profile photo URL

- **POST /verify-email** - Mark email as verified (protected)
  - Sets isEmailVerified flag to true

- **POST /deactivate** - Deactivate account (protected)
  - Sets isActive flag to false
  - Account can be reactivated by admin

### 3. Inter-Service Communication
- **GET /users/id/:userId** - Get user by ID
  - No authentication required
  - Used by other microservices
  - Returns public user data

- **GET /users/email/:email** - Get user by email
  - No authentication required
  - Used by other microservices

## Security Features

✅ **Password Security**
- Bcrypt hashing (10 salt rounds)
- Minimum 6 characters enforced
- Password confirmation validation
- Never returned in API responses

✅ **Authentication**
- JWT tokens (7-day expiry)
- Bearer token in Authorization header
- Token verification middleware
- Secure secret in environment variables

✅ **Input Validation**
- Email format validation
- Required field checking
- Trim and normalize inputs
- Express validator integration

✅ **Database Security**
- Email uniqueness constraint
- Indexed queries
- MongoDB connection pooling
- Environment-based credentials

✅ **API Security**
- CORS enabled
- HTTP status codes
- Error message safety
- No stack trace in production

## Database Schema

### User Collection
```javascript
{
  userId: UUID,                  // unique identifier
  firstName: String,             // required
  lastName: String,              // required
  email: String,                 // required, unique
  password: String (hashed),     // required, secure
  phone: String,                 // optional
  address: {                     // optional
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  profilePhoto: String,          // optional URL
  isEmailVerified: Boolean,      // default: false
  isActive: Boolean,             // default: true
  lastLogin: Date,               // tracks last login
  createdAt: Date,               // auto-set
  updatedAt: Date                // auto-tracked
}
```

## Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to any servers in your MongoDB connection string
```
**Solution:** 
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- Verify MongoDB is accessible

### Token Expired Error
```
Error: Token is invalid or expired
```
**Solution:**
- User needs to login again
- Token expires after 7 days
- Use new token from login response

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
**Solution:**
- Change PORT in .env to different port
- Or kill process using port 3001: `lsof -ti:3001 | xargs kill -9`

## Next Steps

1. **Local Testing** - Test all endpoints locally
2. **Create Other Services** - Implement product-service, order-service, payment-service
3. **Docker Compose** - Set up docker-compose.yml for local testing
4. **Cloud Deployment** - Deploy to Azure Container Apps or AWS ECS
5. **Integration Testing** - Test inter-service communication
6. **Security Scanning** - Set up SonarCloud
7. **CI/CD Pipeline** - Configure GitHub Actions

## File Changes Summary

### Created Files:
- src/config/database.js
- src/models/User.js
- src/controllers/authController.js
- src/controllers/userController.js
- src/routes/auth.js
- src/routes/user.js
- src/middleware/auth.js
- src/server.js
- .env
- .env.example
- .dockerignore
- .gitignore
- Dockerfile
- README.md
- openapi.yaml
- QUICKSTART.md (this file)

### Modified Files:
- package.json (added scripts and dependencies)

## Support & Documentation

- **Full API Docs**: See README.md
- **OpenAPI/Swagger**: See openapi.yaml
- **Code Comments**: Check source files for detailed comments
- **For Inter-Service Integration**: Use `/users/id/:userId` and `/users/email/:email` endpoints

---

**Status**: ✅ COMPLETE AND READY FOR TESTING
