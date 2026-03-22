const axios = require('axios');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const PORT = Number(process.env.PORT) || 8003;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:8002';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/order_service_db';

app.use(cors());
app.use(express.json());

const orderSchema = new mongoose.Schema(
    {
        orderId: { type: Number, required: true, unique: true },
        userId: { type: Number, required: true },
        productId: { type: Number, required: true },
        customerName: { type: String, required: true },
        productName: { type: String, required: true },
        total: { type: Number, required: true },
        createdAt: { type: String, required: true }
    },
    { versionKey: false }
);

const Order = mongoose.model('Order', orderSchema);

async function connectWithRetry() {
    let attempts = 0;

    while (attempts < 10) {
        try {
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log('Order Service connected to MongoDB');
            return;
        } catch (error) {
            attempts += 1;
            console.error(`MongoDB connection failed (attempt ${attempts}/10): ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    throw new Error('Could not connect to MongoDB after retries');
}

async function getNextOrderId() {
    const latestOrder = await Order.findOne({}, { orderId: 1, _id: 0 }).sort({ orderId: -1 }).lean();
    return latestOrder ? latestOrder.orderId + 1 : 1;
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Order Service API',
            version: '1.0.0',
            description: 'Order microservice with synchronous user/product validation'
        },
        servers: [{ url: `http://localhost:${PORT}` }],
        components: {
            schemas: {
                CreateOrderRequest: {
                    type: 'object',
                    required: ['userId', 'productId'],
                    properties: {
                        userId: { type: 'integer', example: 1 },
                        productId: { type: 'integer', example: 101 }
                    }
                },
                OrderResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Order created successfully' },
                        order: {
                            type: 'object',
                            properties: {
                                orderId: { type: 'integer', example: 1 },
                                userId: { type: 'integer', example: 1 },
                                productId: { type: 'integer', example: 101 },
                                customerName: { type: 'string', example: 'Nimal Perera' },
                                productName: { type: 'string', example: 'MacBook Air M2' },
                                total: { type: 'number', example: 300000 },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [__filename]
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

app.get('/docs.json', (req, res) => {
    res.json(swaggerSpec);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Service health endpoints
 *   - name: Orders
 *     description: Order management endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 */
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({ service: 'order-service', status: 'ok', database: dbState });
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all placed orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 */
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find({}, { _id: 0 }).sort({ orderId: 1 }).lean();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order after validating user and product
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Validation or integration error
 *       502:
 *         description: Downstream service unavailable
 */
app.post('/orders', async (req, res) => {
    const { userId, productId } = req.body;

    if (!Number.isInteger(userId) || !Number.isInteger(productId)) {
        return res.status(400).json({
            error: 'userId and productId are required and must be integers'
        });
    }

    try {
        const [userResponse, productResponse] = await Promise.all([
            axios.get(`${USER_SERVICE_URL}/users/${userId}`, { timeout: 3000 }),
            axios.get(`${PRODUCT_SERVICE_URL}/products/${productId}`, { timeout: 3000 })
        ]);

        const user = userResponse.data;
        const product = productResponse.data;

        const order = {
            orderId: await getNextOrderId(),
            userId: user.id,
            productId: product.id,
            customerName: user.name,
            productName: product.name,
            total: product.price,
            createdAt: new Date().toISOString()
        };

        await Order.create(order);

        return res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.status === 400)) {
            return res.status(400).json({
                error: 'Invalid userId or productId. Validation failed in downstream service.'
            });
        }

        return res.status(502).json({
            error: 'Unable to reach dependent services. Please try again.'
        });
    }
});

async function startServer() {
    try {
        await connectWithRetry();
        app.listen(PORT, () => {
            console.log(`Order Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Order Service startup failed: ${error.message}`);
        process.exit(1);
    }
}

startServer();