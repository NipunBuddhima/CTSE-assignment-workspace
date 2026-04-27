# Product Service - Microservice for E-Commerce Platform

A comprehensive product catalog and inventory management microservice built with Node.js, Express, and MongoDB. Provides RESTful APIs for managing products, categories, pricing, and inventory operations.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Inter-Service Communication](#inter-service-communication)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Product Catalog
- ✅ Create, Read, Update, Delete (CRUD) operations for products
- ✅ Product categories and tags for organization
- ✅ Full product information: name, description, SKU, specifications
- ✅ Product images and ratings support
- ✅ Advanced search with filtering by category, price range, and availability
- ✅ Pagination and sorting (by price, rating, date)
- ✅ Product deactivation (soft delete)

### Inventory Management
- ✅ Real-time inventory tracking (total quantity, reserved, available)
- ✅ Reserve inventory for pending orders
- ✅ Release reserved inventory when orders are cancelled
- ✅ Consume inventory when orders are completed
- ✅ Restock functionality with timestamp tracking
- ✅ Low stock alerts with configurable reorder levels
- ✅ Warehouse tracking
- ✅ Inventory calculation methods (available = quantity - reserved)

### Additional Features
- ✅ Comprehensive input validation with express-validator
- ✅ Error handling and standardized response formats
- ✅ CORS enabled for cross-service communication
- ✅ Health check endpoint for monitoring
- ✅ Docker containerization with multi-stage builds
- ✅ Environment-based configuration
- ✅ MongoDB connection management
- ✅ Graceful shutdown handling

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 5.2.1 |
| Database | MongoDB | 5.0+ |
| Validation | express-validator | 7.0.0 |
| UUID | uuid | 9.0.0 |
| HTTP Client | axios | 1.13.6 |
| Container | Docker | Latest |
| Orchestration | Docker Compose | 3.8 |

## 📁 Project Structure

```
product-service/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   ├── models/
│   │   └── Product.js           # Product schema with methods
│   ├── controllers/
│   │   └── productController.js # Business logic for products
│   ├── routes/
│   │   └── product.js           # API endpoint routes
│   ├── middleware/
│   │   # Future: authentication, authorization middleware
│   └── server.js                # Express app initialization
├── package.json                 # Project dependencies
├── .env                        # Environment variables (development)
├── .env.example                # Template for .env file
├── .gitignore                  # Git ignore patterns
├── .dockerignore                # Docker ignore patterns
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker Compose configuration
├── openapi.yaml                # OpenAPI/Swagger specification
├── README.md                   # This file
├── QUICKSTART.md               # Quick start guide
└── IMPLEMENTATION_SUMMARY.md   # Implementation details
```

## 📦 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 10 or higher (comes with Node.js)
- **MongoDB**: Version 5.0+ (can use Docker container)
- **Docker**: (Optional) For containerized deployment

## 🚀 Installation & Setup

### 1. Clone/Navigate to the Project
```bash
cd product-service
```

### 2. Install Dependencies
```bash
npm install
```

### 3. MongoDB Setup

**Option A: Using Docker (Recommended)**
```bash
# Start MongoDB container
docker-compose up -d
# MongoDB will be available at mongodb://localhost:27017/product-service
```

**Option B: Local MongoDB Installation**
```bash
# Ensure MongoDB is running on port 27017
# Create database: product-service
```

### 4. Create .env File
Copy `.env.example` to `.env` and update if needed:
```bash
cp .env.example .env
```

Default configuration:
```env
PORT=3002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/product-service
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3002 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/product-service |

### Database Configuration

MongoDB connection is configured in `src/config/database.js`:
- Uses mongoose for ODM
- Auto-reconnect enabled
- Connection pooling configured

## ▶️ Running the Service

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Check Service Health
```bash
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "product-service",
  "timestamp": "2024-03-25T10:30:00.000Z"
}
```

## 📚 API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Catalog Operations

#### Get All Products
```bash
GET /api/products
# Query parameters:
# - page=1              (pagination)
# - limit=10            (items per page)
# - category=Electronics (filter by category)
# - search=iPhone       (search name/description)
# - minPrice=100        (price range)
# - maxPrice=1000
# - sort=createdAt      (createdAt, price-asc, price-desc, rating)
# - inStock=true        (only in stock)
```

#### Get Single Product
```bash
GET /api/products/id/{productId}
```

#### Get Product by SKU
```bash
GET /api/products/sku/{sku}
```

#### Create Product
```bash
POST /api/products
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple smartphone",
  "category": "Electronics",
  "price": {
    "originalPrice": 1200,
    "currentPrice": 999,
    "discount": 16
  },
  "sku": "IP15P-256GB-BLACK",
  "inventory": {
    "quantity": 50,
    "reorderLevel": 20
  },
  "specifications": {
    "color": "Black",
    "weight": "187g",
    "material": "Titanium",
    "brand": "Apple"
  },
  "tags": ["smartphone", "premium", "latest"]
}
```

#### Update Product
```bash
PUT /api/products/{productId}

{
  "name": "Updated Name",
  "price": {
    "currentPrice": 899
  }
}
```

#### Delete Product
```bash
DELETE /api/products/{productId}
```

### Inventory Operations

#### Get Inventory Details
```bash
GET /api/products/{productId}/inventory
```

Response:
```json
{
  "success": true,
  "data": {
    "productId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "iPhone 15 Pro",
    "sku": "IP15P-256GB-BLACK",
    "inventory": {
      "quantity": 50,
      "reserved": 5,
      "available": 45,
      "warehouse": "Main Warehouse",
      "reorderLevel": 20,
      "isLowOnStock": false
    }
  }
}
```

#### Restock Product
```bash
POST /api/products/{productId}/restock
Content-Type: application/json

{
  "quantity": 100
}
```

#### Reserve Inventory (for orders)
```bash
POST /api/products/{productId}/reserve

{
  "quantity": 5
}
```

#### Release Inventory (order cancelled)
```bash
POST /api/products/{productId}/release

{
  "quantity": 5
}
```

#### Consume Inventory (order completed)
```bash
POST /api/products/{productId}/consume

{
  "quantity": 5
}
```

#### Get Low Stock Products
```bash
GET /api/products/inventory/low-stock
```

## 🧪 Testing

### Using Postman

1. **Start Service**
   ```bash
   npm run dev
   ```

2. **Import OpenAPI Specification**
   - Open Postman
   - Click "Import" → "Paste raw text"
   - Paste contents of `openapi.yaml`

3. **Test Catalog Operations**

   **Create Product**
   ```
   POST /api/products
   
   Body (JSON):
   {
     "name": "Laptop",
     "description": "High-performance laptop",
     "category": "Electronics",
     "price": 999,
     "sku": "LAPTOP-001",
     "inventory": {
       "quantity": 30
     }
   }
   ```

   **Get All Products**
   ```
   GET /api/products?category=Electronics&sort=price-asc
   ```

   **Search Products**
   ```
   GET /api/products?search=laptop&minPrice=500&maxPrice=2000
   ```

4. **Test Inventory Operations**

   **Reserve Inventory**
   ```
   POST /api/products/{productId}/reserve
   
   Body:
   {
     "quantity": 5
   }
   ```

   **Get Inventory Status**
   ```
   GET /api/products/{productId}/inventory
   ```

   **Restock**
   ```
   POST /api/products/{productId}/restock
   
   Body:
   {
     "quantity": 100
   }
   ```

### Using curl

```bash
# Create product
curl -X POST http://localhost:3002/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tablet",
    "description": "Portable tablet",
    "category": "Electronics",
    "price": 599,
    "sku": "TAB-001",
    "inventory": {"quantity": 20}
  }'

# Get all products
curl http://localhost:3002/api/products

# Reserve inventory
curl -X POST http://localhost:3002/api/products/{productId}/reserve \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

## 🐳 Docker Deployment

### Option 1: Using docker-compose.yml (Recommended)

```bash
# Start service and MongoDB
docker-compose up -d

# Check logs
docker-compose logs -f product-service

# Stop service
docker-compose down
```

### Option 2: Build and Run Separately

```bash
# Build image
docker build -t product-service:latest .

# Run container
docker run -d \
  --name product-service \
  -p 3002:3002 \
  -e MONGODB_URI="mongodb://admin:password@localhost:27017/product-service?authSource=admin" \
  product-service:latest

# Check health
curl http://localhost:3002/health
```

## 🔗 Inter-Service Communication

### Used by Order Service

Order Service calls Product Service to:

1. **Get Product Details**
   ```javascript
   const response = await axios.get('http://product-service:3002/api/products/id/{productId}');
   ```

2. **Reserve Inventory**
   ```javascript
   await axios.post(`http://product-service:3002/api/products/${productId}/reserve`, {
     quantity: orderQty
   });
   ```

3. **Get Product by SKU**
   ```javascript
   const product = await axios.get(`http://product-service:3002/api/products/sku/${sku}`);
   ```

4. **Release Reservation**
   ```javascript
   await axios.post(`http://product-service:3002/api/products/${productId}/release`, {
     quantity: qty
   });
   ```

### Service Endpoints for Integration

- `GET /api/products/id/{productId}` - Get product details (no auth required)
- `GET /api/products/sku/{sku}` - Get by SKU (no auth required)
- `POST /api/products/{productId}/reserve` - Reserve stock
- `POST /api/products/{productId}/release` - Release stock
- `POST /api/products/{productId}/consume` - Complete order
- `GET /api/products/{productId}/inventory` - Check availability

## 📖 Data Model

### Product Schema

```javascript
{
  productId: String (UUID),           // Unique identifier
  name: String (required),             // Product name
  description: String (required),      // Full description
  category: String (required),         // Product category
  price: {
    originalPrice: Number (required),  // Full price
    currentPrice: Number (required),   // Sale price
    discount: Number                   // Discount percentage (0-100)
  },
  sku: String (required, unique),     // Stock keeping unit
  inventory: {
    quantity: Number,                  // Total stock
    reserved: Number,                  // Reserved for orders
    warehouse: String,                 // Warehouse location
    reorderLevel: Number,              // Minimum before reorder
    lastRestocked: Date               // Last restock timestamp
  },
  specifications: {
    weight: String,
    dimensions: {...},
    material: String,
    color: String,
    brand: String
  },
  images: Array,                       // Product images
  rating: {
    averageRating: Number (0-5),
    reviewCount: Number
  },
  isActive: Boolean,                   // Soft delete flag
  tags: Array,                         // Search tags
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Considerations

- **Input Validation**: All inputs validated with express-validator
- **Query Limits**: Pagination enforces max 100 items per page
- **Soft Deletes**: Products marked inactive rather than hard deleted
- **Error Messages**: Generic error messages in production mode
- **Environment Secrets**: Sensitive configs in .env (not committed)
- **CORS**: Configured for microservice communication
- **Rate Limiting**: (Recommended) Add express-rate-limit in production

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error**: `ECONNREFUSED at 127.0.0.1:27017`

Solution:
```bash
# Ensure MongoDB is running
docker-compose up -d

# Or check if MongoDB is running locally
mongosh
```

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3002`

Solution:
```bash
# Kill process using port 3002
lsof -i :3002
kill -9 <PID>

# Or change port in .env
PORT=3003
npm run dev
```

### Validation Errors

**Error**: `Validation errors: [...errors...]`

Solution:
- Ensure all required fields are provided
- Check field types match schema (numbers, strings, etc.)
- Validate JSON formatting

### Docker Issues

**Error**: `docker: command not found`

Solution:
```bash
# Install Docker Desktop or Docker Engine
# Restart terminal after installation
```

**Error**: `Cannot connect to Docker daemon`

Solution:
```bash
# Start Docker Desktop application
# Or start Docker daemon:
sudo systemctl start docker
```

## 📝 Logging

Service logs are output to console:

```
Product service running on port 3002
MongoDB connected successfully to product-service database
```

For production, integrate with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Datadog
- New Relic

## 🤝 Contributing

Guidelines for contributing to this service:

1. Follow Express.js best practices
2. Add input validation for all endpoints
3. Write error-handling middleware
4. Use async/await for database operations
5. Update API documentation (openapi.yaml)
6. Test thoroughly before committing

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For issues or questions:
1. Check Troubleshooting section
2. Review API documentation in openapi.yaml
3. Check MongoDB connection settings
4. Verify environment variables in .env

---

**Last Updated**: March 25, 2024  
**Version**: 1.0.0  
**Maintained by**: CTSE Team
