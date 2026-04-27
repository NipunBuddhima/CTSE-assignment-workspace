process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.PORT = '3091';

// Mock database so tests don't need a real MongoDB connection
jest.mock('../src/config/database', () => jest.fn());

const request = require('supertest');
const app = require('../src/server');

describe('User Service - Health & Core Endpoints', () => {
    describe('GET /health', () => {
        it('should return 200 with service status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toMatch(/User Service/i);
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /', () => {
        it('should return service info', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body).toHaveProperty('version');
            expect(res.body.endpoints).toHaveProperty('health');
        });
    });

    describe('Security Headers', () => {
        it('should include security headers from helmet', async () => {
            const res = await request(app).get('/health');
            expect(res.headers).toHaveProperty('x-content-type-options');
            expect(res.headers).toHaveProperty('x-frame-options');
        });
    });

    describe('POST /api/auth/register - Validation', () => {
        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com' }); // missing password, name
            expect(res.statusCode).toBe(400);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'not-an-email', password: 'Test@123', firstName: 'Test', lastName: 'User' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login - Validation', () => {
        it('should return 400 for empty credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({});
            expect(res.statusCode).toBe(400);
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
