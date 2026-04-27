# ShopHub Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                 │
│                      http://localhost:5173                       │
│  Features: Product Browse, Cart, Auth, Orders, Profile         │
└────────────────────────────┬────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │ (RESTful APIs)  │ (RESTful APIs)  │
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  User Service    │ │ Product Service  │ │  Order Service   │
│ :3001/api/auth   │ │ :3002/api/...    │ │ :3003/api/orders │
│ :3001/api/user   │ │ Products CRUD    │ │ Order Management │
│ JWT Token Mgmt   │ │ Inventory Mgmt   │ │ Tracking         │
└────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                ┌─────────────┴──────────┐
                │                        │
                ▼                        ▼
        ┌────────────────┐       ┌──────────────────┐
        │  MongoDB Atlas │       │ Payment Service  │
        │  (Database)    │       │ :3004/api/...    │
        │                │       │ Payment Processing│
        │ Collections:   │       │ Stripe/PayPal    │
        │ - Users        │       │ Transaction Log  │
        │ - Products     │       └──────────────────┘
        │ - Orders       │
        │ - Payments     │
        └────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React 19.2.4
- **Bundler:** Vite 8.0.1
- **Styling:** Tailwind CSS 4.2.2
- **Icons:** React Icons 5.6.0
- **Routing:** React Router v7.13.2
- **HTTP Client:** Axios 1.13.6
- **Build Target:** ES Module

### Backend (Microservices)
- **Runtime:** Node.js (18-20 Alpine)
- **Framework:** Express.js
- **Database:** MongoDB 5
- **Authentication:** JWT (jsonwebtoken)
- **Password:** bcrypt
- **Validation:** express-validator
- **CORS:** Enabled on all services

### DevOps & Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Database:** MongoDB Community Edition
- **Network:** Docker Bridge Network (ecommerce-network)
- **Ports:** 
  - Frontend: 5173
  - Services: 3001-3004
  - Database: 27017

## Service Architecture

### 1. User Service (Port 3001)
**Responsibilities:**
- User registration and login
- JWT token generation and validation
- User profile management
- Password management

**API Endpoints:**
```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - User login
POST   /api/auth/change-password    - Change password
GET    /api/user/profile            - Get user profile
PUT    /api/user/profile            - Update profile
POST   /api/user/verify-email       - Verify email
POST   /api/user/deactivate         - Deactivate account
GET    /health                      - Health check
```

**Database Schema:**
```javascript
User {
  userId: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  profile: {
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Product Service (Port 3002)
**Responsibilities:**
- Product catalog management
- Inventory tracking
- Search and filtering
- Product categorization

**API Endpoints:**
```
GET    /api/products                - Get all products (with filters)
GET    /api/products/id/:productId  - Get single product
GET    /api/products/sku/:sku       - Get product by SKU
POST   /api/products                - Create product
PUT    /api/products/:productId     - Update product
DELETE /api/products/:productId     - Delete product
GET    /api/products/:id/inventory  - Get inventory
POST   /api/products/:id/restock    - Restock product
POST   /api/products/:id/reserve    - Reserve inventory
POST   /api/products/:id/release    - Release inventory
GET    /health                      - Health check
```

**Database Schema:**
```javascript
Product {
  productId: ObjectId,
  sku: String (unique),
  name: String,
  description: String,
  category: String,
  price: {
    originalPrice: Number,
    currentPrice: Number,
    discount: Number (%)
  },
  images: [{
    url: String,
    alt: String
  }],
  inventory: {
    quantity: Number,
    reserved: Number
  },
  rating: {
    averageRating: Number,
    reviewCount: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Order Service (Port 3003)
**Responsibilities:**
- Order creation and management
- Order status tracking
- Shipping information
- Order history

**API Endpoints:**
```
POST   /api/orders                  - Create new order
GET    /api/orders                  - Get all orders
GET    /api/orders/:orderId         - Get order by ID
GET    /api/orders/user/:userId/orders - Get user's orders
PUT    /api/orders/:id/status       - Update order status
POST   /api/orders/:id/tracking     - Add tracking event
POST   /api/orders/:id/cancel       - Cancel order
GET    /api/orders/:id/tracking     - Get tracking info
GET    /api/orders/:userId/history  - Get order history
GET    /api/orders/stats/summary    - Get order statistics
GET    /health                      - Health check
```

**Database Schema:**
```javascript
Order {
  orderId: ObjectId,
  userId: ObjectId (ref User),
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (pending, confirmed, shipped, delivered),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  trackingEvents: [{
    event: String,
    timestamp: Date,
    description: String
  }],
  paymentStatus: String (pending, completed, failed),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Payment Service (Port 3004)
**Responsibilities:**
- Payment processing
- Payment method management
- Transaction history
- Refund handling

**API Endpoints:**
```
POST   /api/payments                - Create payment
POST   /api/payments/:id/process    - Process payment
POST   /api/payments/:id/authorize  - Authorize payment
POST   /api/payments/:id/charge     - Charge payment
GET    /api/payments/:paymentId     - Get payment details
GET    /api/payments/order/:orderId - Get payment by order
GET    /api/payments/user/:userId   - Get user's payments
POST   /api/payments/:id/refund     - Process refund
GET    /api/payments/:id/transactions - Get transactions
GET    /api/payments/transactions/list - Get all transactions
POST   /api/payments/:id/invoice    - Generate invoice
GET    /api/payments/invoices/:id   - Get invoice
GET    /health                      - Health check
```

**Database Schema:**
```javascript
Payment {
  paymentId: ObjectId,
  orderId: ObjectId (ref Order),
  userId: ObjectId (ref User),
  amount: Number,
  currency: String,
  method: String (credit_card, paypal, debit_card),
  status: String (pending, authorized, charged, failed),
  transactionId: String,
  transactions: [{
    type: String,
    amount: Number,
    status: String,
    timestamp: Date
  }],
  paymentDetails: {
    gateway: String,
    cardLast4: String,
    expiryDate: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Data Flow

### User Registration Flow
```
Frontend Form → Register API → User Service → MongoDB
                                    ↓
                           Generate JWT Token
                                    ↓
                         Return Token to Frontend
                                    ↓
                         Store in localStorage
```

### Product Browse Flow
```
Frontend Request → Product Service → MongoDB Query
                         ↓
                  Apply Filters/Sort
                         ↓
                   Return Products
                         ↓
                   Frontend Render
```

### Order Creation Flow
```
Frontend Checkout → Order Service → Create Order → MongoDB
       ↓                                ↓
   Validate User            Validate Products
       ↓                                ↓
   Get Cart Items ←── Product Service ─→ Reserve Inventory
       ↓
   Create Order
       ↓
   Payment Service (for payment processing)
       ↓
   Return Order ID to Frontend
```

## Communication Patterns

### Service-to-Service Communication
```
Order Service → User Service (validate user)
Order Service → Product Service (validate products & reserve inventory)
Payment Service → Order Service (get order details)
Frontend → All Services (via REST APIs)
```

### Authentication & Authorization
- Frontend: Stores JWT token in localStorage
- Services: Validate JWT on protected endpoints
- User Service: Issues and manages tokens
- Other Services: Verify tokens from frontend

## Scalability Considerations

### Current Architecture
- Single MongoDB instance (suitable for development)
- Horizontal scaling ready (services are stateless)
- Load balancer can be added for frontend

### Future Scaling
1. **Database:** MongoDB Atlas (cloud) or replica set
2. **Services:** Add container orchestration (Kubernetes)
3. **Frontend:** CDN for static assets
4. **Caching:** Redis for session/product cache
5. **Message Queue:** RabbitMQ/Kafka for async operations
6. **API Gateway:** Kong or Nginx for routing

## Security Architecture

### Authentication
```
1. User login → Generate JWT token
2. Token stored in localStorage
3. Each API request includes token in Authorization header
4. Server validates token signature
5. Token expires in 7 days
```

### Data Protection
- Passwords hashed with bcrypt (10 rounds)
- MongoDB credentials in environment variables
- CORS configured to allow only trusted origins
- Input validation on all endpoints
- SQL injection protection (MongoDB prevents this)

### API Security
```
Request → CORS Check → 
        → Body Validation → 
        → JWT Verification (for auth required endpoints) → 
        → Route Handler → 
        → Database Operation → 
        → Response (with proper error handling)
```

## Monitoring & Health Checks

### Health Endpoints
Each service exposes `/health` endpoint returning:
```json
{
  "status": "ok",
  "service": "service-name",
  "timestamp": "ISO-8601-timestamp"
}
```

### Docker Health Checks
```
User Service:   HTTP check every 30s, timeout 10s
Product Service: Same configuration
Order Service:   Same configuration
Payment Service: Same configuration
MongoDB:        ping command every 10s
```

### Logging
- Service logs written to stdout
- Docker captures logs automatically
- Access via: `docker-compose logs SERVICE_NAME`

## Performance Optimization

### Frontend
- Vite for fast HMR in development
- Production build with tree-shaking
- CSS minification with Tailwind
- Image optimization ready
- Code splitting by routes

### Backend
- Request timeout: 10 seconds
- Database query optimization with indexes
- Pagination support for large datasets
- Response compression (gzip ready)

### Database
- Indexes on frequently queried fields
- Connection pooling
- Document structure optimized for queries

## Deployment Strategy

### Development
```bash
docker-compose up -d
```

### Production
1. Use managed MongoDB (Atlas)
2. Set environment variables
3. Use container registry (Docker Hub)
4. Deploy with Docker Compose or Kubernetes
5. Set up monitoring and alerting
6. Configure HTTPS/SSL
7. Set up CDN for frontend

## Disaster Recovery

### Backup Strategy
- MongoDB: Daily automated backups (Atlas)
- Frontend: Version control (Git)
- Configuration: Environment backups

### Rollback Plan
- Docker image versioning
- Database snapshots
- Git tag for releases

---

## Summary

This architecture provides:
- ✅ Separation of concerns (microservices)
- ✅ Scalable design
- ✅ Secure communication
- ✅ Easy testing and debugging
- ✅ Containerized deployment
- ✅ Production-ready foundation

The system is designed to handle growth and can be easily extended with additional services or features.
