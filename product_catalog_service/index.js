const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const PORT = Number(process.env.PORT) || 8002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/product_service_db';

app.use(cors());
app.use(express.json());

const productSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 }
    },
    { versionKey: false }
);

const Product = mongoose.model('Product', productSchema);

async function seedProducts() {
    const count = await Product.countDocuments();
    if (count > 0) {
        return;
    }

    await Product.insertMany([
        { id: 101, name: 'MacBook Air M2', price: 300000 },
        { id: 102, name: 'Wireless Mouse', price: 5000 },
        { id: 103, name: 'Mechanical Keyboard', price: 18000 }
    ]);
}

async function connectWithRetry() {
    let attempts = 0;

    while (attempts < 10) {
        try {
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log('Product Service connected to MongoDB');
            return;
        } catch (error) {
            attempts += 1;
            console.error(`MongoDB connection failed (attempt ${attempts}/10): ${error.message}`);
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }

    throw new Error('Could not connect to MongoDB after retries');
}

const swaggerOptions = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Product Service API',
            version: '1.0.0',
            description: 'Product microservice for mock product management'
        },
        servers: [{ url: `http://localhost:${PORT}` }]
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
 *   - name: Products
 *     description: Product management endpoints
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
    res.status(200).json({ service: 'product-service', status: 'ok', database: dbState });
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({}, { _id: 0 }).sort({ id: 1 }).lean();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Product not found
 */
app.get('/products/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Product ID must be an integer' });
    }

    let product;
    try {
        product = await Product.findOne({ id }, { _id: 0 }).lean();
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch product' });
    }

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json(product);
});

async function startServer() {
    try {
        await connectWithRetry();
        await seedProducts();
        app.listen(PORT, () => {
            console.log(`Product Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Product Service startup failed: ${error.message}`);
        process.exit(1);
    }
}

startServer();