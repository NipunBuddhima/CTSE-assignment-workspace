# Product Service - Quick Start Guide

Get the Product Service up and running in 5 minutes!

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

Service runs on **http://localhost:3002**

## ✓ Verify It's Working

### Health Check
```bash
curl http://localhost:3002/health
```

Response:
```json
{
  "status": "ok",
  "service": "product-service",
  "timestamp": "2024-03-25T10:30:00.000Z"
}
```

## 🗂️ Project Structure

```
product-service/
├── src/
│   ├── config/database.js       ← MongoDB setup
│   ├── models/Product.js        ← Data schema
│   ├── controllers/             ← Business logic
│   ├── routes/product.js        ← API endpoints
│   └── server.js                ← Main app
├── openapi.yaml                 ← API documentation
├── docker-compose.yml           ← MongoDB config
└── package.json                 ← Dependencies
```

## 📌 10 Essential API Calls

### 1. Create a Product
```bash
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "Powerful laptop for professionals",
    "category": "Electronics",
    "price": 1999,
    "sku": "MBP-16-M3",
    "inventory": {"quantity": 25}
  }'
```

### 2. Get All Products
```bash
curl http://localhost:3002/api/products
```

### 3. Search Products
```bash
curl "http://localhost:3002/api/products?search=MacBook&maxPrice=2500"
```

### 4. Get Single Product
```bash
curl http://localhost:3002/api/products/id/{productId}
```

### 5. Get Product by SKU
```bash
curl http://localhost:3002/api/products/sku/MBP-16-M3
```

### 6. Reserve Inventory
```bash
curl -X POST http://localhost:3002/api/products/{productId}/reserve \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

### 7. Check Inventory Status
```bash
curl http://localhost:3002/api/products/{productId}/inventory
```

### 8. Restock Product
```bash
curl -X POST http://localhost:3002/api/products/{productId}/restock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 50}'
```

### 9. Release Reserved Inventory
```bash
curl -X POST http://localhost:3002/api/products/{productId}/release \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

### 10. Get Low Stock Products
```bash
curl http://localhost:3002/api/products/inventory/low-stock
```

## 🧪 Testing with Postman

### Import Collection
1. Open Postman
2. Click "Import"
3. Choose "Paste raw text"
4. Copy contents of `openapi.yaml`
5. Click Import

### Test Workflow
1. Create a product
2. Get the productId from response
3. Reserve inventory
4. Check inventory status
5. Release/consume inventory

## 📊 Key Features

| Feature | Endpoint | Method |
|---------|----------|--------|
| List products | `/api/products` | GET |
| Create product | `/api/products` | POST |
| Get product | `/api/products/id/{id}` | GET |
| Update product | `/api/products/{id}` | PUT |
| Delete product | `/api/products/{id}` | DELETE |
| Check inventory | `/api/products/{id}/inventory` | GET |
| Reserve stock | `/api/products/{id}/reserve` | POST |
| Restock | `/api/products/{id}/restock` | POST |
| Release stock | `/api/products/{id}/release` | POST |
| Consume stock | `/api/products/{id}/consume` | POST |
| Low stock | `/api/products/inventory/low-stock` | GET |

## 🐳 Docker Commands

```bash
# Start service and MongoDB
docker-compose up -d

# View logs
docker-compose logs -f product-service

# Stop everything
docker-compose down

# Remove volumes and start fresh
docker-compose down -v
docker-compose up -d
```

## 📂 Database Access

### View Data with MongoDB Compass
1. Download & Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Username: `admin`
4. Password: `password`
5. Database: `product-service`

### Command Line (mongosh)
```bash
# Connect
mongosh

# Use database
use product-service

# View products
db.products.find().pretty()

# Find low stock
db.products.find({"inventory.quantity": {$lt: 20}})

# Count products
db.products.countDocuments()
```

## ⚙️ Environment Variables

Create `.env` file:
```env
PORT=3002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/product-service
```

## 🚨 Common Issues & Fixes

### Port 3002 Already in Use
```bash
# Kill the process
lsof -i :3002
kill -9 <PID>
```

### MongoDB Connection Error
```bash
# Ensure Docker is running
docker-compose up -d

# Check MongoDB is ready
curl http://localhost:27017
```

### Dependencies Missing
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Cannot Find MongoDB
```bash
# Start MongoDB container
docker-compose up -d mongodb
```

## 📚 Full Documentation

- **OpenAPI Specification**: See `openapi.yaml` for complete API details
- **Full README**: See `README.md` for comprehensive documentation
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🔗 Integration with Order Service

Product Service provides these endpoints for Order Service:

```javascript
// Get product details (no auth needed)
GET /api/products/id/{productId}
GET /api/products/sku/{sku}

// Reserve stock when order is created
POST /api/products/{productId}/reserve
{ "quantity": 5 }

// Release stock when order is cancelled
POST /api/products/{productId}/release
{ "quantity": 5 }

// Consume stock when order is completed
POST /api/products/{productId}/consume
{ "quantity": 5 }
```

## 🎯 Next Steps

1. ✅ Service running on port 3002
2. ✅ MongoDB running on port 27017
3. Create some test products
4. Test inventory operations
5. Integrate with Order Service
6. Set up CI/CD pipeline
7. Deploy to Azure Container Apps

---

**Need Help?** See README.md for detailed documentation and troubleshooting.
