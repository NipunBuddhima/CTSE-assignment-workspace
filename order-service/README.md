# Order Service - Microservice for E-Commerce Platform

A comprehensive order management and tracking microservice built with Node.js, Express, and MongoDB. Provides RESTful APIs for creating orders, managing inventory reservations, tracking shipments, and maintaining order history.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Inter-Service Communication](#inter-service-communication)
- [Order Status Flow](#order-status-flow)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Order Management
- ✅ Create orders with validation from User and Product services
- ✅ Retrieve all orders with pagination, filtering, and sorting
- ✅ Get single order by ID
- ✅ Get user's orders (user-specific view)
- ✅ Update order status with history tracking
- ✅ Cancel orders and release inventory
- ✅ Soft delete support for orders

### Inventory Integration
- ✅ Reserve inventory when order is created
- ✅ Release inventory when order is cancelled
- ✅ Consume inventory when order is completed (via Payment Service)
- ✅ Real-time inventory checking before order confirmation
- ✅ Automatic rollback if inventory operations fail

### Order Tracking
- ✅ Real-time order status updates
- ✅ Complete order history with timestamps
- ✅ Tracking events (created, confirmed, shipped, delivered, cancelled)
- ✅ Tracking number and carrier information
- ✅ Location-based tracking updates
- ✅ Estimated delivery dates
- ✅ Order timeline view

### Payment Integration
- ✅ Payment method selection
- ✅ Payment status tracking (pending, completed, failed, refunded)
- ✅ Transaction ID logging
- ✅ Refund support
- ✅ Payment timestamp recording

### Order Analytics
- ✅ Order statistics by status
- ✅ Revenue calculations (total and average)
- ✅ User-specific analytics
- ✅ Order trend analysis
- ✅ Filtering and aggregation

### Additional Features
- ✅ Comprehensive input validation
- ✅ Error handling and recovery
- ✅ CORS enabled for cross-service communication
- ✅ Inter-service HTTP calls (User, Product, Payment services)
- ✅ Health check endpoint
- ✅ Docker containerization
- ✅ Environment-based configuration

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 5.2.1 |
| Database | MongoDB | 5.0+ |
| ODM | Mongoose | 7.7.1 |
| Validation | express-validator | 7.0.0 |
| HTTP Client | axios | 1.13.6 |
| UUID | uuid | 9.0.0 |
| Container | Docker | Latest |
| Orchestration | Docker Compose | 3.8 |

## 📁 Project Structure

```
order-service/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   └── Order.js             # Order schema with tracking
│   ├── controllers/
│   │   └── orderController.js   # All business logic
│   ├── routes/
│   │   └── order.js             # All API routes
│   └── server.js                # Express app
├── package.json                 # Dependencies
├── .env                        # Environment config
├── .env.example                # Template
├── .gitignore                  # Git patterns
├── Dockerfile                  # Container image
├── docker-compose.yml          # MongoDB + Service
├── openapi.yaml                # API specification
├── README.md                   # Full documentation
├── QUICKSTART.md               # Quick reference
└── IMPLEMENTATION_SUMMARY.md   # Detailed specs
```

## 📦 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 10 or higher
- **MongoDB**: Version 5.0+ (via Docker)
- **Docker**: (Optional) For containerized deployment
- **Running Services**:
  - User Service (port 3001)
  - Product Service (port 3002)

## 🚀 Installation & Setup

### 1. Navigate to the Project
```bash
cd order-service
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
```bash
cp .env.example .env
```

Configuration:
```env
PORT=3003
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/order-service
USER_SERVICE_URL=http://localhost:3001/api/users
PRODUCT_SERVICE_URL=http://localhost:3002/api/products
```

### 4. Start MongoDB
```bash
docker-compose up -d
```

### 5. Start the Service
```bash
npm run dev
```

## ▶️ Running the Service

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Verify Health
```bash
curl http://localhost:3003/health
```

## 📚 API Endpoints (18 Total)

### Order Creation & Retrieval (4)

**Create Order**
```bash
POST /api/orders
Body: {
  "userId": "user-id",
  "items": [
    { "productId": "product-id", "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "street": "123 Main St",
    "city": "Springfield",
    "postalCode": "12345"
  }
}
```

**Get All Orders**
```bash
GET /api/orders?page=1&limit=10&status=pending
```

**Get Order by ID**
```bash
GET /api/orders/{orderId}
```

**Get User's Orders**
```bash
GET /api/orders/user/{userId}/orders?page=1&limit=10
```

### Order Status Management (2)

**Update Order Status**
```bash
PUT /api/orders/{orderId}/status
Body: {
  "status": "confirmed",
  "notes": "Payment received",
  "trackingNumber": "ABC123456",
  "carrier": "FedEx"
}
```

**Cancel Order**
```bash
POST /api/orders/{orderId}/cancel
Body: { "reason": "Changed mind" }
```

### Order Tracking (3)

**Add Tracking Event**
```bash
POST /api/orders/{orderId}/tracking
Body: {
  "event": "shipped",
  "location": "Distribution Center A",
  "description": "Package shipped"
}
```

**Get Order Tracking**
```bash
GET /api/orders/{orderId}/tracking
```

**Get Order History**
```bash
GET /api/orders/{userId}/history?page=1&limit=20
```

### Payment Management (1)

**Update Payment Status**
```bash
PUT /api/orders/{orderId}/payment
Body: {
  "paymentStatus": "completed",
  "transactionId": "TXN123456"
}
```

### Analytics (1)

**Get Order Statistics**
```bash
GET /api/orders/stats/summary?userId=optional-user-id
```

## 🔄 Order Status Flow

```
PENDING
  ↓
  (User confirms)
CONFIRMED
  ↓
  (Payment received)
PROCESSING
  ↓
  (Package shipped)
SHIPPED
  ↓
  (In transit)
DELIVERED
  ↓
  (Order complete)

Alternative: CANCELLED (from pending or confirmed)
```

## 🧪 Testing the Service

### Test 1: Create Order
```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "items": [
      {"productId": "product-id-here", "quantity": 2}
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "street": "123 Main Street",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "USA"
    },
    "paymentMethod": "credit_card"
  }'
```

Response includes `orderId` - save it for next tests!

### Test 2: Get All Orders
```bash
curl "http://localhost:3003/api/orders"
```

### Test 3: Get Single Order
```bash
curl "http://localhost:3003/api/orders/{orderId}"
```

### Test 4: Update Order Status
```bash
curl -X PUT http://localhost:3003/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "notes": "Order confirmed by admin"
  }'
```

### Test 5: Add Tracking Event
```bash
curl -X POST http://localhost:3003/api/orders/{orderId}/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipped",
    "location": "Distribution Center",
    "description": "Package is on the way"
  }'
```

### Test 6: Get Tracking Information
```bash
curl "http://localhost:3003/api/orders/{orderId}/tracking"
```

### Test 7: Update Payment Status
```bash
curl -X PUT http://localhost:3003/api/orders/{orderId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "completed",
    "transactionId": "TXN-123456789"
  }'
```

### Test 8: Cancel Order
```bash
curl -X POST http://localhost:3003/api/orders/{orderId}/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested cancellation"
  }'
```

### Test 9: Get User's Orders
```bash
curl "http://localhost:3003/api/orders/user/{userId}/orders"
```

### Test 10: Get Order History
```bash
curl "http://localhost:3003/api/orders/{userId}/history"
```

### Test 11: Get Statistics
```bash
curl "http://localhost:3003/api/orders/stats/summary"
```

## 🔗 Inter-Service Communication

### Calls to User Service
1. **Verify user exists** when creating order
   ```
   GET /api/users/id/{userId}
   ```

### Calls to Product Service
1. **Get product details** when creating order
   ```
   GET /api/products/id/{productId}
   ```

2. **Reserve inventory** when order is created
   ```
   POST /api/products/{productId}/reserve
   { "quantity": amount }
   ```

3. **Release inventory** when order is cancelled
   ```
   POST /api/products/{productId}/release
   { "quantity": amount }
   ```

4. **Consume inventory** when order is completed
   ```
   POST /api/products/{productId}/consume
   { "quantity": amount }
   ```

## 📊 Data Model

### Order Schema

```javascript
{
  orderId: String (UUID),
  userId: String (required),
  userEmail: String,
  items: [{
    productId: String,
    sku: String,
    productName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  summary: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    discount: Number,
    total: Number
  },
  status: String (enum: pending, confirmed, processing, shipped, delivered, cancelled),
  statusHistory: [{
    status: String,
    timestamp: Date,
    notes: String,
    updatedBy: String
  }],
  tracking: {
    currentStatus: String,
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    events: [{
      event: String,
      timestamp: Date,
      location: String,
      description: String
    }]
  },
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  billingAddress: {...},
  payment: {
    method: String (enum: credit_card, debit_card, paypal, bank_transfer, other),
    status: String (enum: pending, completed, failed, refunded),
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🐳 Docker Deployment

### Using docker-compose.yml
```bash
# Start service and MongoDB
docker-compose up -d

# Check logs
docker-compose logs -f order-service

# Stop service
docker-compose down
```

### Build and Run Separately
```bash
# Build image
docker build -t order-service:latest .

# Run container
docker run -d \
  --name order-service \
  -p 3003:3003 \
  -e MONGODB_URI="mongodb://localhost:27017/order-service" \
  order-service:latest
```

## 🔐 Security Features

- ✅ Input validation on all endpoints
- ✅ User verification via User Service
- ✅ Inventory validation via Product Service
- ✅ Transactional integrity (reserve/release/consume)
- ✅ Error handling with rollback
- ✅ CORS configured
- ✅ Environment secrets in .env

## 📈 Performance Optimizations

- Database indexes on frequently queried fields (orderId, userId, status)
- Pagination enforced (max 100 items per request)
- Efficient aggregation for statistics
- Connection pooling configured
- Stateless design for horizontal scaling

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Ensure MongoDB is running
docker-compose up -d mongodb

# Check MongoDB logs
docker logs order-mongodb
```

### User Service Not Available
```bash
# Ensure User Service is running on port 3001
curl http://localhost:3001/health
```

### Product Service Not Available
```bash
# Ensure Product Service is running on port 3002
curl http://localhost:3002/health
```

### Port 3003 Already in Use
```bash
# Kill process using port 3003
lsof -i :3003
kill -9 <PID>

# Or change port in .env
PORT=3004
npm run dev
```

### Insufficient Inventory Error
```
Error: Insufficient inventory for product ABC123. Available: 5
```
Solution: Reduce order quantity or wait for restock

### Order Cancellation Fails
```
Error: Cannot cancel order with status: shipped
```
Solution: Only pending and confirmed orders can be cancelled

## 📞 Support

For issues or questions:
1. Check Troubleshooting section
2. Verify all services are running (User, Product, Order)
3. Check environment variables in .env
4. Review API documentation in openapi.yaml
5. Check MongoDB connection and database

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: March 25, 2024
