import axios from 'axios';

const GATEWAY_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

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

const api = createApiClient(GATEWAY_BASE_URL);

// ================== USER SERVICE ==================

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (email, password) => api.post('/auth/login', { email, password }),
    changePassword: (currentPassword, newPassword, confirmPassword) =>
        api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword }),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    verifyEmail: () => api.post('/users/verify-email'),
    deactivateAccount: () => api.post('/users/deactivate'),
};

// ================== PRODUCT SERVICE ==================

export const productService = {
    getAllProducts: (filters = {}) => api.get('/products', { params: filters }),
    getProductById: (productId) => api.get(`/products/id/${productId}`),
    getProductBySku: (sku) => api.get(`/products/sku/${sku}`),
    createProduct: (data) => api.post('/products', data),
    updateProduct: (productId, data) => api.put(`/products/${productId}`, data),
    deleteProduct: (productId) => api.delete(`/products/${productId}`),
    getInventory: (productId) => api.get(`/products/${productId}/inventory`),
    restockProduct: (productId, quantity) =>
        api.post(`/products/${productId}/restock`, { quantity }),
    reserveInventory: (productId, quantity) =>
        api.post(`/products/${productId}/reserve`, { quantity }),
    releaseInventory: (productId, quantity) =>
        api.post(`/products/${productId}/release`, { quantity }),
};

// ================== ORDER SERVICE ==================

export const orderService = {
    createOrder: (data) => api.post('/orders', data),
    getAllOrders: (filters = {}) => api.get('/orders', { params: filters }),
    getOrderById: (orderId) => api.get(`/orders/${orderId}`),
    getUserOrders: (userId) => api.get(`/orders/user/${userId}/orders`),
    updateOrderStatus: (orderId, status) =>
        api.put(`/orders/${orderId}/status`, { status }),
    addTrackingEvent: (orderId, event) =>
        api.post(`/orders/${orderId}/tracking`, { event }),
    cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),
    getOrderTracking: (orderId) => api.get(`/orders/${orderId}/tracking`),
    getOrderHistory: (userId) => api.get(`/orders/${userId}/history`),
    getOrderStats: () => api.get('/orders/stats/summary'),
};

// ================== PAYMENT SERVICE ==================

export const paymentService = {
    createPayment: (data) => api.post('/payments', data),
    processPayment: (paymentId) => api.post(`/payments/${paymentId}/process`),
    authorizePayment: (paymentId) =>
        api.post(`/payments/${paymentId}/authorize`),
    chargePayment: (paymentId) => api.post(`/payments/${paymentId}/charge`),
    getPaymentById: (paymentId) => api.get(`/payments/${paymentId}`),
    getPaymentByOrderId: (orderId) =>
        api.get(`/payments/order/${orderId}`),
    getUserPayments: (userId) => api.get(`/payments/user/${userId}/payments`),
    refundPayment: (paymentId, amount, reason) =>
        api.post(`/payments/${paymentId}/refund`, { amount, reason }),
    getTransactionHistory: (paymentId) =>
        api.get(`/payments/${paymentId}/transactions`),
    getAllTransactions: () => api.get('/payments/transactions/list'),
    generateInvoice: (paymentId, data) =>
        api.post(`/payments/${paymentId}/invoice`, data),
    getInvoice: (invoiceId) => api.get(`/payments/invoices/${invoiceId}`),
    getPaymentInvoices: (paymentId) =>
        api.get(`/payments/${paymentId}/invoices`),
};

export default {
    authService,
    productService,
    orderService,
    paymentService,
};
