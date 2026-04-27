# Payment Service - Quick Start Guide

Get the Payment Service running in 5 minutes!

## 📋 Prerequisites

- Node.js 18+
- MongoDB installed and running
- npm or yarn

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy example .env file
cp .env.example .env

# Edit .env if needed (default localhost settings work for local development)
```

### Step 3: Start the Service
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
MongoDB connected successfully to payment-service database
Payment service running on port 3004
```

## ✅ Verify Installation

Check the health endpoint:
```bash
curl http://localhost:3004/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "payment-service",
  "timestamp": "2024-03-25T10:30:00.000Z"
}
```

## 🐳 Docker Quick Start

### Using Docker Compose (Recommended)

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f payment-service
```

Services will be available at:
- Payment Service: http://localhost:3004
- MongoDB: localhost:27018

### Stop Services
```bash
docker-compose down
```

## 💳 Test the API

### 1. Create a Payment

```bash
curl -X POST http://localhost:3004/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order123",
    "userId": "user456",
    "amount": 99.99,
    "currency": "USD",
    "paymentMethod": {
      "type": "credit_card",
      "last4": "4242",
      "brand": "visa"
    }
  }'
```

**Expected**: 201 Created with payment ID

### 2. Process Payment

Replace `{paymentId}` with the ID from step 1:

```bash
curl -X POST http://localhost:3004/api/payments/{paymentId}/process \
  -H "Content-Type: application/json" \
  -d '{
    "processorReference": "pi_123456",
    "processorCustomerId": "cus_123456"
  }'
```

**Expected**: 200 OK with payment charged

### 3. Get Payment Details

```bash
curl http://localhost:3004/api/payments/{paymentId}
```

**Expected**: 200 OK with payment data

### 4. Get Transactions

```bash
curl http://localhost:3004/api/payments/{paymentId}/transactions
```

**Expected**: 200 OK with transaction history

### 5. Generate Invoice

```bash
curl -X POST http://localhost:3004/api/payments/{paymentId}/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2024-04-25"
  }'
```

**Expected**: 201 Created with invoice data

### 6. Refund Payment

```bash
curl -X POST http://localhost:3004/api/payments/{paymentId}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "reason": "Customer request"
  }'
```

**Expected**: 200 OK with refund initiated

### 7. Get Statistics

```bash
curl http://localhost:3004/api/payments/stats/summary
```

**Expected**: 200 OK with payment statistics

## 📊 Common Workflows

### Full Payment Processing Workflow

1. **Create Payment**
   ```bash
   POST /api/payments
   ```

2. **Authorize Payment**
   ```bash
   POST /api/payments/{paymentId}/authorize
   ```

3. **Charge Payment**
   ```bash
   POST /api/payments/{paymentId}/charge
   ```

4. **Optional: Refund**
   ```bash
   POST /api/payments/{paymentId}/refund
   ```

5. **Optional: Generate Invoice**
   ```bash
   POST /api/payments/{paymentId}/invoice
   ```

### Retry Failed Payment

```bash
# Try to retry a failed payment (up to 3 times)
POST /api/payments/{paymentId}/retry
```

### Open Dispute

```bash
POST /api/payments/{paymentId}/dispute \
  -d '{
    "reason": "Unauthorized transaction",
    "evidence": ["screenshot1.jpg"]
  }'
```

## 🔍 Monitoring

### View Logs (Docker)

```bash
# Service logs
docker-compose logs -f payment-service

# MongoDB logs
docker-compose logs -f mongodb

# All logs
docker-compose logs -f
```

### Check Service Status

```bash
# Health check
curl http://localhost:3004/health

# Get service statistics
curl http://localhost:3004/api/payments/stats/summary
```

## 🧪 Test with Postman

Import the OpenAPI specification:

1. Open Postman
2. Click "Import"
3. For "Link", enter: `file://openapi.yaml`
4. Click "Import"

All endpoints will be available in Postman for testing!

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: MongoDB connection failed
```

**Solution**:
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Docker: Ensure mongodb service started first

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3004
```

**Solution**:
- Change PORT in .env to an available port
- Or kill the process using port 3004

### Service Not Responding
```
Error: connect ECONNREFUSED
```

**Solution**:
- Ensure service is running: `npm start`
- Check PORT environment variable
- Verify firewall settings

## 📚 Next Steps

- Read full [README.md](README.md) for detailed documentation
- Check [openapi.yaml](openapi.yaml) for complete API specification
- Review payment workflows in documentation
- Set up integration with Order and User services

## 🆘 Support

For issues:
1. Check the logs: `npm run dev`
2. Verify Service URL environment variables
3. Ensure all dependencies are installed: `npm install`
4. Check database connection: MongoDB running on port 27017 (or 27018 in Docker)

---

**Ready to go!** 🎉

Start making API calls to the Payment Service at:
```
http://localhost:3004/api/payments
```

Health check endpoint:
```
http://localhost:3004/health
```
