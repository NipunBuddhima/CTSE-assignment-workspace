process.env.NODE_ENV = 'test';
process.env.PORT = '3092';

// Mock database so tests don't need a real MongoDB connection
jest.mock('../src/config/database', () => jest.fn());

const request = require('supertest');
const app = require('../src/server');

describe('Product Service - Health & Core Endpoints', () => {
    describe('GET /health', () => {
        it('should return 200 with service status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body.service).toBe('product-service');
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

    describe('GET /api/products', () => {
        it('should respond to products endpoint (DB not required for route existence)', async () => {
            const res = await request(app).get('/api/products');
            // With no DB it may 500, but should NOT 404 (route exists)
            expect(res.statusCode).not.toBe(404);
        });
    });

    describe('Input Validation', () => {
        it('should return 400 or 500 but not 404 for POST /api/products without body', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({});
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
