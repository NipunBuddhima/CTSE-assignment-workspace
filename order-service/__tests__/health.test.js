process.env.NODE_ENV = 'test';
process.env.PORT = '3093';
process.env.USER_SERVICE_URL = 'http://localhost:3001/api/users';
process.env.PRODUCT_SERVICE_URL = 'http://localhost:3002/api/products';

// Mock database so tests don't need a real MongoDB connection
jest.mock('../src/config/database', () => jest.fn());

const request = require('supertest');
const app = require('../src/server');

describe('Order Service - Health & Core Endpoints', () => {
    describe('GET /health', () => {
        it('should return 200 with service status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.service).toBe('order-service');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('Security Headers', () => {
        it('should include security headers from helmet', async () => {
            const res = await request(app).get('/health');
            expect(res.headers).toHaveProperty('x-content-type-options');
            expect(res.headers).toHaveProperty('x-frame-options');
        });
    });

    describe('POST /api/orders - Validation', () => {
        it('should return 400 for order creation with missing required fields', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({}); // empty body - missing userId, items, shippingAddress
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when items array is empty', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({
                    userId: '507f1f77bcf86cd799439011',
                    items: [],
                    shippingAddress: { street: '123 Main St', city: 'Colombo', country: 'LK' },
                });
            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /nonexistent', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/nonexistent-route');
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });
});
