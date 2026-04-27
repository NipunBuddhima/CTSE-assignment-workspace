const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const paymentController = require('../controllers/paymentController');

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

// ============ PAYMENT CREATION ============

// POST /api/payments - Create new payment
router.post(
    '/',
    [
        body('orderId').trim().notEmpty().withMessage('Order ID is required'),
        body('userId').trim().notEmpty().withMessage('User ID is required'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
        body('paymentMethod.type')
            .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'digital_wallet'])
            .withMessage('Invalid payment method type'),
    ],
    handleValidationErrors,
    paymentController.createPayment
);

// ============ PAYMENT PROCESSING ============

// POST /api/payments/:paymentId/process - Process payment
router.post('/:paymentId/process', paymentController.processPayment);

// POST /api/payments/:paymentId/authorize - Authorize payment
router.post(
    '/:paymentId/authorize',
    paymentController.authorizePayment
);

// POST /api/payments/:paymentId/charge - Charge authorized payment
router.post('/:paymentId/charge', paymentController.chargePayment);

// ============ PAYMENT RETRIEVAL ============

// GET /api/payments/:paymentId - Get payment by ID
router.get('/:paymentId', paymentController.getPaymentById);

// GET /api/payments/order/:orderId - Get payment by order ID
router.get('/order/:orderId', paymentController.getPaymentByOrderId);

// GET /api/payments/user/:userId - Get user's payments
router.get('/user/:userId/payments', paymentController.getUserPayments);

// ============ REFUNDS ============

// POST /api/payments/:paymentId/refund - Refund payment
router.post(
    '/:paymentId/refund',
    [
        body('amount').optional().isFloat({ gt: 0 }).withMessage('Refund amount must be greater than 0'),
        body('reason').optional().trim(),
    ],
    handleValidationErrors,
    paymentController.refundPayment
);

// ============ TRANSACTIONS ============

// GET /api/payments/:paymentId/transactions - Get transaction history for a payment
router.get('/:paymentId/transactions', paymentController.getTransactionHistory);

// GET /api/transactions - Get all transactions
router.get('/transactions/list', paymentController.getAllTransactions);

// ============ INVOICES ============

// POST /api/payments/:paymentId/invoice - Generate invoice
router.post(
    '/:paymentId/invoice',
    [
        body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    ],
    handleValidationErrors,
    paymentController.generateInvoice
);

// GET /api/invoices/:invoiceId - Get invoice
router.get('/invoices/:invoiceId', paymentController.getInvoice);

// GET /api/payments/:paymentId/invoices - Get payment invoices
router.get('/:paymentId/invoices', paymentController.getPaymentInvoices);

// ============ RETRY ============

// POST /api/payments/:paymentId/retry - Retry payment
router.post('/:paymentId/retry', paymentController.retryPayment);

// ============ DISPUTES ============

// POST /api/payments/:paymentId/dispute - Open dispute
router.post(
    '/:paymentId/dispute',
    [
        body('reason').trim().notEmpty().withMessage('Dispute reason is required'),
        body('evidence').optional().isArray().withMessage('Evidence must be an array'),
    ],
    handleValidationErrors,
    paymentController.openDispute
);

// PUT /api/payments/:paymentId/dispute/:disputeId - Resolve dispute
router.put(
    '/:paymentId/dispute/:disputeId',
    [
        body('status')
            .isIn(['opened', 'under_review', 'won', 'lost', 'resolved'])
            .withMessage('Invalid dispute status'),
    ],
    handleValidationErrors,
    paymentController.resolveDispute
);

// ============ STATISTICS ============

// GET /api/payments/stats/summary - Get payment statistics
router.get('/stats/summary', paymentController.getPaymentStats);

// ============ CANCEL ============

// POST /api/payments/:paymentId/cancel - Cancel payment
router.post(
    '/:paymentId/cancel',
    [
        body('reason').optional().trim(),
    ],
    handleValidationErrors,
    paymentController.cancelPayment
);

module.exports = router;
