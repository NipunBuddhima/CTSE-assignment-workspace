# Order Service - Quick Start Guide

Get the Order Service up and running in 5 minutes!

## ⚡ Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start MongoDB
```bash
docker-compose up -d
```

### 3. Start the Service
```bash
npm run dev
```

Service runs on **http://localhost:3003**

## ✓ Verify It's Working

### Health Check
```bash
curl http://localhost:3003/health
```

Response:
```json
{
  "status": "ok",
  "service": "order-service",
  "timestamp": "2024-03-25T10:30:00.000Z"
}
```

## 🗂️ Project Structure

```
order-service/
├── src/
│   ├── config/database.js       ← MongoDB setup
│   ├── models/Order.js          ← Order schema
│   ├── controllers/             ← All business logic
│   ├── routes/order.js          ← API endpoints
│   └── server.js                ← Main app
├── openapi.yaml                 ← API documentation
├── docker-compose.yml           ← MongoDB config
└── package.json                 ← Dependencies
```

## 📌 10 Essential API Calls

### Prerequisites
You need:
- User Service running (port 3001)
- Product Service running (port 3002)
- A valid userId from User Service
- A valid productId from Product Service

### 1. Create an Order
```bash
curl -X POST http://localhost:3003/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id-here",
    "items": [
      {"productId": "your-product-id-here", "quantity": 2}
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "USA"
    }
  }'
```

**Save the orderId from response!**

### 2. Get All Orders
```bash
curl http://localhost:3003/api/orders
```

### 3. Get Single Order
```bash
curl http://localhost:3003/api/orders/{orderId}
```

### 4. Update Order Status to Confirmed
```bash
curl -X PUT http://localhost:3003/api/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### 5. Add Tracking Event - Shipped
```bash
curl -X POST http://localhost:3003/api/orders/{orderId}/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "event": "shipped",
    "location": "Distribution Center",
    "description": "Package shipped via FedEx"
  }'
```

### 6. Get Order Tracking Info
```bash
curl http://localhost:3003/api/orders/{orderId}/tracking
```

### 7. Update Payment Status
```bash
curl -X PUT http://localhost:3003/api/orders/{orderId}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "completed",
    "transactionId": "TXN-12345678"
  }'
```

### 8. Get User's Orders
```bash
curl http://localhost:3003/api/orders/user/{userId}/orders
```

### 9. Get Order History
```bash
curl http://localhost:3003/api/orders/{userId}/history
```

### 10. Cancel Order (only if pending/confirmed)
```bash
curl -X POST http://localhost:3003/api/orders/{orderId}/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "Customer requested"}'
```

## 📊 Key Features

| Feature | Endpoint | Method |
|---------|----------|--------|
| Create order | `/api/orders` | POST |
| List orders | `/api/orders` | GET |
| Get order | `/api/orders/{id}` | GET |
| Update status | `/api/orders/{id}/status` | PUT |
| Cancel order | `/api/orders/{id}/cancel` | POST |
| Add tracking | `/api/orders/{id}/tracking` | POST |
| Get tracking | `/api/orders/{id}/tracking` | GET |
| User orders | `/api/orders/user/{id}/orders` | GET |
| Order history | `/api/orders/{id}/history` | GET |
| Update payment | `/api/orders/{id}/payment` | PUT |
| Statistics | `/api/orders/stats/summary` | GET |

## 🐳 Docker Commands

```bash
# Start service and MongoDB
docker-compose up -d

# View logs
docker-compose logs -f order-service

# Stop everything
docker-compose down

# Remove volumes and start fresh
docker-compose down -v
docker-compose up -d
```

## 📂 Database Access

### MongoDB Compass
1. Download MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Username: `admin`
4. Password: `password`
5. Database: `order-service`

### mongosh CLI
```bash
# Connect
mongosh

# Use database
use order-service

# View orders
db.orders.find().pretty()

# Find pending orders
db.orders.find({status: "pending"})

# Count orders
db.orders.countDocuments()

# Find orders by user
db.orders.find({userId: "user-id-here"})
```

## ⚙️ Environment Variables

```env
PORT=3003
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/order-service
USER_SERVICE_URL=http://localhost:3001/api/users
PRODUCT_SERVICE_URL=http://localhost:3002/api/products
```

## 🚨 Common Issues & Fixes

### User Service Connection Error
```
Error: User not found
```
Solution: 
- Ensure User Service is running on port 3001
- Check USER_SERVICE_URL in .env
- Verify userId exists in User Service

### Product Service Connection Error
```
Error: Product not found
```
Solution:
- Ensure Product Service is running on port 3002
- Create products in Product Service first
- Check PRODUCT_SERVICE_URL in .env

### Insufficient Inventory
```
Error: Insufficient inventory for product ABC. Available: 0
```
Solution:
- Restock the product in Product Service
- Use a different product with stock
- Reduce order quantity

### MongoDB Connection Error
```bash
# Start MongoDB container
docker-compose up -d mongodb
```

### Cannot Cancel Order
```
Error: Cannot cancel order with status: shipped
```
Solution: Only pending and confirmed orders can be cancelled

### Dependencies Missing
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Full Documentation

See these files for detailed information:
- **README.md** - Complete guide
- **IMPLEMENTATION_SUMMARY.md** - Feature breakdown
- **openapi.yaml** - Full API specification

## 🔗 Service Integration Flow

```
Order Service (Port 3003)
    ↓
    → Calls User Service (Port 3001)
    → Verifies user exists
    ↓
    → Calls Product Service (Port 3002)
    → Gets product details
    → Checks inventory
    → Reserves stock
    ↓
Order Created Successfully
    ↓
Future: Calls Payment Service (Port 3004)
    → Process payment
    → Update order status
    ↓
Future: Calls Shipping Service
    → Generate shipping label
    → Update tracking
```

## 🎯 Next Steps

1. ✅ Order Service running on port 3003
2. ✅ MongoDB running on port 27017
3. ✅ Integrated with User Service (port 3001)
4. ✅ Integrated with Product Service (port 3002)
5. **Next**: Implement Payment Service
6. **Then**: Implement Shipping Service
7. **Finally**: Root docker-compose.yml for all services

---

**Need Help?** See README.md for detailed documentation.
