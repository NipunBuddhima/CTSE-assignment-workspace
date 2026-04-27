process.env.NODE_ENV = 'test';
process.env.PORT = '3094';
process.env.ORDER_SERVICE_URL = 'http://localhost:3003/api/orders';
process.env.USER_SERVICE_URL = 'http://localhost:3001/api/users';

// Mock database so tests don't need a real MongoDB connection
jest.mock('../src/config/database', () => jest.fn());

const request = require('supertest');
const app = require('../src/server');

describe('Payment Service - Health & Core Endpoints', () => {
    describe('GET /health', () => {
        it('should return 200 with service status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.service).toBe('payment-service');
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

    describe('POST /api/payments - Validation', () => {
        it('should not return 404 for payments endpoint', async () => {
            const res = await request(app)
                .post('/api/payments')
                .send({});
            // Route should exist even if validation fails
            expect(res.statusCode).not.toBe(404);
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
