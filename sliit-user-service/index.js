const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const PORT = Number(process.env.PORT) || 8001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_service_db';

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true }
    },
    { versionKey: false }
);

const User = mongoose.model('User', userSchema);

async function seedUsers() {
    const count = await User.countDocuments();
    if (count > 0) {
        return;
    }

    await User.insertMany([
        { id: 1, name: 'Nimal Perera', email: 'nimal@example.com' },
        { id: 2, name: 'Kamal Silva', email: 'kamal@example.com' },
        { id: 3, name: 'Ayesha Fernando', email: 'ayesha@example.com' }
    ]);
}

async function connectWithRetry() {
    let attempts = 0;

    while (attempts < 10) {
        try {
            await mongoose.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000
            });
            console.log('User Service connected to MongoDB');
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
            title: 'User Service API',
            version: '1.0.0',
            description: 'User microservice for mock user management'
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
 *   - name: Users
 *     description: User management endpoints
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
    res.status(200).json({ service: 'user-service', status: 'ok', database: dbState });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { _id: 0 }).sort({ id: 1 }).lean();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: User not found
 */
app.get('/users/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'User ID must be an integer' });
    }

    let user;
    try {
        user = await User.findOne({ id }, { _id: 0 }).lean();
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
});

async function startServer() {
    try {
        await connectWithRetry();
        await seedUsers();
        app.listen(PORT, () => {
            console.log(`User Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`User Service startup failed: ${error.message}`);
        process.exit(1);
    }
}

startServer();