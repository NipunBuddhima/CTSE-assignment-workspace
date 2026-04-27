# Payment Service

A comprehensive payment processing microservice for e-commerce platforms with support for multiple payment methods, transaction logging, refund management, and invoice generation.

## 🚀 Features

### Payment Processing
- **Multiple Payment Methods**: Credit card, debit card, PayPal, bank transfer, digital wallets
- **Payment States**: Pending, Authorized, Charged, Refunded, Failed, Cancelled
- **Payment Authorization**: Support for authorized payments
- **Payment Charging**: Charge authorized payments
- **Payment Cancellation**: Cancel pending or failed payments

### Transaction Management
- **Transaction Logging**: Complete transaction history for every payment
- **Transaction Types**: Charge, Refund, Partial Refund, Retry, Reversal
- **Transaction Status Tracking**: Pending, Success, Failed, Cancelled
- **Transaction Details**: Amount, currency, timestamp, processor reference, authorization code

### Refund Management
- **Full Refunds**: Refund entire payment amount
- **Partial Refunds**: Refund partial amounts
- **Refund History**: Track all refunds with amounts and dates
- **Refund Status**: Pending, Completed, Failed
- **Refund Tracking**: Monitor refund processing status

### Invoice Management
- **Invoice Generation**: Automatically generate invoices for payments
- **Invoice Numbers**: Unique invoice numbering
- **Invoice Items**: Line items with descriptions, quantities, and prices
- **Invoice Status**: Draft, Sent, Partial, Paid, Overdue, Cancelled
- **Due Dates**: Configurable payment due dates

### Retry Logic
- **Automatic Retry**: Retry failed payments up to 3 times
- **Retry Tracking**: Track retry attempts
- **Smart Retry Scheduling**: Schedule retries with exponential backoff
- **Retry Statistics**: Monitor retry success rates

### Dispute Management
- **Dispute Opening**: Open disputes for payments
- **Dispute Status**: Opened, Under Review, Won, Lost, Resolved
- **Evidence Tracking**: Collect and store dispute evidence
- **Dispute Resolution**: Resolve disputes with outcome tracking

### Analytics & Statistics
- **Payment Metrics**: Total payments, counts by status
- **Revenue Analytics**: Total revenue, average order value, min/max amounts
- **Refund Analytics**: Total refunded amounts, refund counts
- **User Analytics**: Get statistics for specific users
- **Date Filtering**: Filter statistics by date range

### Inter-Service Integration
- **Order Service**: Verify orders and update payment status
- **User Service**: Verify users and retrieve user information
- **Automatic Updates**: Update order payment status after processing

## 📊 Data Models

### Payment
```javascript
{
  paymentId: String (UUID),
  orderId: String,
  userId: String,
  amount: Number,
  currency: String,
  status: String (enum),
  paymentMethod: Object,
  processor: String,
  processorPaymentId: String,
  amountBreakdown: {
    subtotal, tax, shipping, discount, total
  },
  refunds: Array,
  retryCount: Number,
  disputes: Array,
  billingAddress: Object,
  metadata: Mixed,
  createdAt: Date,
  chargedAt: Date
}
```

### Transaction
```javascript
{
  transactionId: String (UUID),
  paymentId: String,
  type: String (enum),
  amount: Number,
  currency: String,
  status: String (enum),
  processor: String,
  processorReference: String,
  authorizationCode: String,
  description: String,
  timestamp: Date
}
```

### Invoice
```javascript
{
  invoiceId: String (UUID),
  invoiceNumber: String (unique),
  paymentId: String,
  orderId: String,
  items: Array,
  subtotal: Number,
  tax: Number,
  discount: Number,
  total: Number,
  dueDate: Date,
  status: String (enum)
}
```

## 🔌 API Endpoints

### Payment Management (6)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments` | Create payment |
| GET | `/api/payments/{paymentId}` | Get payment by ID |
| GET | `/api/payments/order/{orderId}` | Get payment by order |
| GET | `/api/payments/user/{userId}/payments` | Get user payments |
| POST | `/api/payments/{paymentId}/cancel` | Cancel payment |
| POST | `/api/payments/{paymentId}/process` | Process payment |

### Payment Processing (3)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/{paymentId}/authorize` | Authorize payment |
| POST | `/api/payments/{paymentId}/charge` | Charge payment |
| POST | `/api/payments/{paymentId}/retry` | Retry failed payment |

### Refunds (1)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/{paymentId}/refund` | Refund payment |

### Transactions (2)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/payments/{paymentId}/transactions` | Get transaction history |
| GET | `/api/payments/transactions/list` | Get all transactions |

### Invoices (3)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/{paymentId}/invoice` | Generate invoice |
| GET | `/api/payments/invoices/{invoiceId}` | Get invoice |
| GET | `/api/payments/{paymentId}/invoices` | Get payment invoices |

### Disputes (2)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/{paymentId}/dispute` | Open dispute |
| PUT | `/api/payments/{paymentId}/dispute/{disputeId}` | Resolve dispute |

### Statistics (1)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/payments/stats/summary` | Get statistics |

**Total Endpoints**: 18+

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
cd payment-service
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the service**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 🐳 Docker Setup

### Build and Run

```bash
# Build the Docker image
docker build -t payment-service .

# Run with docker-compose
docker-compose up -d
```

### Docker Compose Services
- **MongoDB**: Port 27018
- **Payment Service**: Port 3004

## 📝 Usage Examples

### Create Payment
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
    },
    "billingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    }
  }'
```

### Process Payment
```bash
curl -X POST http://localhost:3004/api/payments/{paymentId}/process \
  -H "Content-Type: application/json" \
  -d '{
    "processorReference": "pi_1234567890",
    "processorCustomerId": "cus_1234567890"
  }'
```

### Refund Payment
```bash
curl -X POST http://localhost:3004/api/payments/{paymentId}/refund \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "reason": "Customer request"
  }'
```

### Get Transaction History
```bash
curl http://localhost:3004/api/payments/{paymentId}/transactions
```

### Generate Invoice
```bash
curl -X POST http://localhost:3004/api/payments/{paymentId}/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "dueDate": "2024-04-25",
    "items": [
      {
        "description": "Product A",
        "quantity": 1,
        "unitPrice": 99.99,
        "totalPrice": 99.99
      }
    ]
  }'
```

### Get Payment Statistics
```bash
curl "http://localhost:3004/api/payments/stats/summary?userId=user456"
```

## 🔗 Integration Points

### Order Service
- Verifies order existence before payment creation
- Updates order payment status after processing
- Retrieves order amount breakdown

**Endpoint**: `http://localhost:3003/api/orders`

### User Service
- Verifies user existence
- Retrieves user email for payment records

**Endpoint**: `http://localhost:3001/api/users`

## 🔐 Security Features

### Validation
- Amount validation (must be > 0)
- Payment method type validation
- Status enum validation
- Refund amount validation (cannot exceed remaining balance)
- Date format validation

### Data Protection
- Sensitive card data masked in responses
- Expiry dates not exposed in JSON responses
- Unique payment IDs (UUIDs)
- Soft delete support for data retention

### Error Handling
- Comprehensive error messages
- Validation error details
- Service availability checks
- Graceful failure handling

## 📈 Performance

### Optimization
- Database indexing on frequently queried fields
- Pagination for list endpoints
- Efficient aggregation pipelines for statistics
- Transaction logging for audit trail

### Expected Response Times
- Create Payment: 150-300ms
- Process Payment: 200-400ms
- Get Transactions: 50-150ms
- Generate Invoice: 100-250ms
- Statistics: 200-500ms

## 🔄 Payment State Transitions

```
PENDING
  ├─ → AUTHORIZED (authorize payment)
  ├─ → CHARGED (direct charge or charge authorized)
  └─ → FAILED (processing failure)

AUTHORIZED
  ├─ → CHARGED (charge authorized)
  └─ → CANCELLED (cancel authorization)

CHARGED
  ├─ → PARTIAL_REFUND (partial refund)
  └─ → REFUNDED (full refund)

FAILED
  └─ → PENDING (retry)

CANCELLED → (terminal state)
REFUNDED → (terminal state)
```

## 📚 API Documentation

Full OpenAPI 3.0 specification available in `openapi.yaml`

## 🧪 Testing

### Test Scenarios

#### Payment Creation
- Valid payment creation
- Missing required fields
- Invalid payment method
- Non-existent order/user

#### Payment Processing
- Successful payment processing
- Failed payment processing
- Duplicate payment processing

#### Refunds
- Full refund
- Partial refund
- Refund amount exceeds balance
- Refund non-charged payment

#### Transactions
- Transaction history retrieval
- Transaction filtering
- Transaction status tracking

#### Invoices
- Invoice generation
- Invoice retrieval
- Invoice status updates

## 🚀 Deployment

### Environment Configuration

```env
PORT=3004
NODE_ENV=production
MONGODB_URI=mongodb://user:password@host:port/db
ORDER_SERVICE_URL=http://order-service:3003/api/orders
USER_SERVICE_URL=http://user-service:3001/api/users
STRIPE_API_KEY=your_key
PAYPAL_CLIENT_ID=your_id
PAYPAL_CLIENT_SECRET=your_secret
```

### Health Check
```bash
curl http://localhost:3004/health
```

## 📝 Database Indexes

- `paymentId` (unique)
- `orderId`
- `userId`
- `status`
- `createdAt`
- `processor` + `processorPaymentId`
- `orderId` + `userId`

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Update documentation for new features
4. Test inter-service communication

## 📄 License

MIT

## 👥 Support

For issues and questions, contact the CTSE Team.

---

**Version**: 1.0.0  
**Last Updated**: March 25, 2026  
**Status**: Production Ready ✅
