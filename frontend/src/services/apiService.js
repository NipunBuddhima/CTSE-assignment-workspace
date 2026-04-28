import axios from 'axios';

const USER_BASE_URL = 'http://13.60.167.38:3001/api';
const PRODUCT_BASE_URL = 'http://13.62.101.70:3002/api';
const ORDER_BASE_URL = 'http://13.62.98.180:3003/api';
const PAYMENT_BASE_URL = 'http://13.63.56.188:3004/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instances for each service
const createApiClient = (baseURL) => {
    const client = axios.create({
        baseURL,
        timeout: 10000,
        validateStatus: function (status) {
            return status >= 200 && status < 500;
        }
    });

    client.interceptors.request.use((config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Add response interceptor for error handling
    client.interceptors.response.use(
        (response) => {
            // Handle error status codes that axios doesn't throw normally
            if (response.status >= 400) {
                const error = new Error(response.data?.message || `HTTP Error: ${response.status}`);
                error.response = response;
                throw error;
            }
            return response;
        },
        (error) => {
            // Handle network errors
            if (error.message === 'Network Error') {
                console.error(`Network Error connecting to ${baseURL}`);
            }
            return Promise.reject(error);
        }
    );

    return client;
};

const userApi = createApiClient(USER_BASE_URL);
const productApi = createApiClient(PRODUCT_BASE_URL);
const orderApi = createApiClient(ORDER_BASE_URL);
const paymentApi = createApiClient(PAYMENT_BASE_URL);

// ================== USER SERVICE ==================

export const authService = {
    register: (data) => userApi.post('/auth/register', data),
    login: (email, password) => userApi.post('/auth/login', { email, password }),
    changePassword: (currentPassword, newPassword, confirmPassword) =>
        userApi.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
    getProfile: () => userApi.get('/users/profile'),
    updateProfile: (data) => userApi.put('/users/profile', data),
    verifyEmail: () => userApi.post('/users/verify-email'),
    deactivateAccount: () => userApi.post('/users/deactivate'),
};

// ================== PRODUCT SERVICE ==================

export const productService = {
    getAllProducts: (filters = {}) => productApi.get('/products', { params: filters }),
    getProductById: (productId) => productApi.get(`/products/id/${productId}`),
    getProductBySku: (sku) => productApi.get(`/products/sku/${sku}`),
    createProduct: (data) => productApi.post('/products', data),
    updateProduct: (productId, data) => productApi.put(`/products/${productId}`, data),
    deleteProduct: (productId) => productApi.delete(`/products/${productId}`),
    getInventory: (productId) => productApi.get(`/products/${productId}/inventory`),
    restockProduct: (productId, quantity) =>
        productApi.post(`/products/${productId}/restock`, { quantity }),
    reserveInventory: (productId, quantity) =>
        productApi.post(`/products/${productId}/reserve`, { quantity }),
    releaseInventory: (productId, quantity) =>
        productApi.post(`/products/${productId}/release`, { quantity }),
};

// ================== ORDER SERVICE ==================

export const orderService = {
    createOrder: (data) => orderApi.post('/orders', data),
    getAllOrders: (filters = {}) => orderApi.get('/orders', { params: filters }),
    getOrderById: (orderId) => orderApi.get(`/orders/${orderId}`),
    getUserOrders: (userId) => orderApi.get(`/orders/user/${userId}/orders`),
    updateOrderStatus: (orderId, status) =>
        orderApi.put(`/orders/${orderId}/status`, { status }),
    addTrackingEvent: (orderId, event) =>
        orderApi.post(`/orders/${orderId}/tracking`, { event }),
    cancelOrder: (orderId) => orderApi.post(`/orders/${orderId}/cancel`),
    getOrderTracking: (orderId) => orderApi.get(`/orders/${orderId}/tracking`),
    getOrderHistory: (userId) => orderApi.get(`/orders/${userId}/history`),
    getOrderStats: () => orderApi.get('/orders/stats/summary'),
};

// ================== PAYMENT SERVICE ==================

export const paymentService = {
    createPayment: (data) => paymentApi.post('/payments', data),
    processPayment: (paymentId) => paymentApi.post(`/payments/${paymentId}/process`),
    authorizePayment: (paymentId) =>
        paymentApi.post(`/payments/${paymentId}/authorize`),
    chargePayment: (paymentId) => paymentApi.post(`/payments/${paymentId}/charge`),
    getPaymentById: (paymentId) => paymentApi.get(`/payments/${paymentId}`),
    getPaymentByOrderId: (orderId) =>
        paymentApi.get(`/payments/order/${orderId}`),
    getUserPayments: (userId) => paymentApi.get(`/payments/user/${userId}/payments`),
    refundPayment: (paymentId, amount, reason) =>
        paymentApi.post(`/payments/${paymentId}/refund`, { amount, reason }),
    getTransactionHistory: (paymentId) =>
        paymentApi.get(`/payments/${paymentId}/transactions`),
    getAllTransactions: () => paymentApi.get('/payments/transactions/list'),
    generateInvoice: (paymentId, data) =>
        paymentApi.post(`/payments/${paymentId}/invoice`, data),
    getInvoice: (invoiceId) => paymentApi.get(`/payments/invoices/${invoiceId}`),
    getPaymentInvoices: (paymentId) =>
        paymentApi.get(`/payments/${paymentId}/invoices`),
};

export default {
    authService,
    productService,
    orderService,
    paymentService,
};
