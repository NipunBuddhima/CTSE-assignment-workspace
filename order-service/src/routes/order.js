const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const orderController = require('../controllers/orderController');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array(),
        });
    }
    next();
};

// ============ ORDER CREATION ============

// POST /api/orders - Create new order
router.post(
    '/',
    [
        body('userId').trim().notEmpty().withMessage('User ID is required'),
        body('items').isArray({ min: 1 }).withMessage('Items array must have at least 1 item'),
        body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
        body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
        body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
        body('shippingAddress.street').notEmpty().withMessage('Street is required'),
        body('shippingAddress.city').notEmpty().withMessage('City is required'),
        body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    ],
    handleValidationErrors,
    orderController.createOrder
);

// ============ ORDER RETRIEVAL ============

// GET /api/orders - Get all orders (with pagination and filtering)
router.get('/', orderController.getAllOrders);

// GET /api/orders/:orderId - Get single order by ID
router.get('/:orderId', orderController.getOrderById);

// GET /api/orders/user/:userId - Get user's orders
router.get('/user/:userId/orders', orderController.getUserOrders);

// ============ ORDER UPDATES ============

// PUT /api/orders/:orderId/status - Update order status
router.put(
    '/:orderId/status',
    [
        body('status')
            .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
            .withMessage('Invalid status'),
    ],
    handleValidationErrors,
    orderController.updateOrderStatus
);

// POST /api/orders/:orderId/tracking - Add tracking event
router.post(
    '/:orderId/tracking',
    [
        body('event')
            .isIn(['created', 'confirmed', 'payment_received', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'])
            .withMessage('Invalid tracking event'),
    ],
    handleValidationErrors,
    orderController.addTrackingEvent
);

// ============ ORDER CANCELLATION ============

// POST /api/orders/:orderId/cancel - Cancel order
router.post('/:orderId/cancel', orderController.cancelOrder);

// ============ ORDER TRACKING ============

// GET /api/orders/:orderId/tracking - Get order tracking information
router.get('/:orderId/tracking', orderController.getOrderTracking);

// GET /api/orders/user/:userId/history - Get user's order history
router.get('/:userId/history', orderController.getOrderHistory);

// ============ ORDER STATISTICS ============

// GET /api/orders/stats/summary - Get order statistics
router.get('/stats/summary', orderController.getOrderStats);

// ============ PAYMENT ============

// PUT /api/orders/:orderId/payment - Update payment status
router.put(
    '/:orderId/payment',
    [
        body('paymentStatus')
            .isIn(['pending', 'completed', 'failed', 'refunded'])
            .withMessage('Invalid payment status'),
    ],
    handleValidationErrors,
    orderController.updatePaymentStatus
);

module.exports = router;
