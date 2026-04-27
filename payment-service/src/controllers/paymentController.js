const { Payment, Transaction, Invoice } = require('../models/Payment');
const axios = require('axios');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3003/api/orders';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001/api/users';

// ============ PAYMENT CREATION & INITIALIZATION ============

exports.createPayment = async (req, res) => {
    try {
        const {
            orderId,
            userId,
            amount,
            currency = 'USD',
            paymentMethod,
            billingAddress,
            metadata,
            description,
        } = req.body;

        // Validate required fields
        if (!orderId || !userId || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId, userId, amount, paymentMethod',
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0',
            });
        }

        // Verify order exists
        let orderData;
        try {
            const orderResponse = await axios.get(`${ORDER_SERVICE_URL}/${orderId}`);
            orderData = orderResponse.data.data;
        } catch (err) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Verify user exists
        let userData;
        try {
            const userResponse = await axios.get(`${USER_SERVICE_URL}/id/${userId}`);
            userData = userResponse.data.data;
        } catch (err) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Validate payment method
        const validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'digital_wallet'];
        if (!validMethods.includes(paymentMethod.type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method type',
            });
        }

        // Create payment
        const newPayment = new Payment({
            orderId,
            userId,
            userEmail: userData.email,
            amount,
            currency,
            paymentMethod,
            billingAddress: billingAddress || {},
            amountBreakdown: {
                subtotal: orderData.summary?.subtotal || 0,
                tax: orderData.summary?.tax || 0,
                shipping: orderData.summary?.shipping || 0,
                discount: orderData.summary?.discount || 0,
                total: amount,
            },
            metadata,
            description: description || `Payment for order ${orderId}`,
            processor: 'stripe', // Default processor
        });

        await newPayment.save();

        // Create initial transaction record
        const transaction = new Transaction({
            paymentId: newPayment.paymentId,
            type: 'charge',
            amount,
            currency,
            status: 'pending',
            description: `Initial payment for order ${orderId}`,
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: newPayment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ PAYMENT PROCESSING ============

exports.processPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { processorReference, processorCustomerId } = req.body;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot process payment with status: ${payment.status}`,
            });
        }

        // Simulate payment processor call (would call Stripe/PayPal API in production)
        const isSuccessful = Math.random() > 0.1; // 90% success rate for demo

        if (isSuccessful) {
            payment.status = 'charged';
            payment.chargedAt = new Date();
            payment.processorPaymentId = processorReference;
            payment.processorCustomerId = processorCustomerId;

            // Update transaction
            await Transaction.updateOne(
                { paymentId },
                {
                    status: 'success',
                    processorReference,
                    authorizationCode: `AUTH_${Date.now()}`,
                }
            );

            // Update order payment status
            try {
                await axios.put(`${ORDER_SERVICE_URL}/${payment.orderId}/payment`, {
                    paymentStatus: 'completed',
                    transactionId: processorReference,
                });
            } catch (err) {
                console.error('Failed to update order payment status:', err.message);
            }
        } else {
            payment.status = 'failed';
            payment.failedAt = new Date();

            // Update transaction
            await Transaction.updateOne(
                { paymentId },
                {
                    status: 'failed',
                    failureReason: 'Payment declined by processor',
                }
            );
        }

        await payment.save();

        res.status(200).json({
            success: isSuccessful,
            message: isSuccessful ? 'Payment processed successfully' : 'Payment processing failed',
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ PAYMENT AUTHORIZATION ============

exports.authorizePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot authorize payment with status: ${payment.status}`,
            });
        }

        payment.status = 'authorized';
        payment.authorizedAt = new Date();

        const transaction = new Transaction({
            paymentId,
            type: 'charge',
            amount: payment.amount,
            currency: payment.currency,
            status: 'success',
            description: 'Payment authorized',
            authorizationCode: `AUTH_${Date.now()}`,
        });

        await transaction.save();
        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment authorized successfully',
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ PAYMENT CHARGING ============

exports.chargePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (payment.status !== 'authorized' && payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot charge payment with status: ${payment.status}`,
            });
        }

        payment.status = 'charged';
        payment.chargedAt = new Date();

        const transaction = new Transaction({
            paymentId,
            type: 'charge',
            amount: payment.amount,
            currency: payment.currency,
            status: 'success',
            description: 'Payment charged',
            authorizationCode: `CHARGE_${Date.now()}`,
        });

        await transaction.save();
        await payment.save();

        // Update order
        try {
            await axios.put(`${ORDER_SERVICE_URL}/${payment.orderId}/payment`, {
                paymentStatus: 'completed',
                transactionId: transaction.transactionId,
            });
        } catch (err) {
            console.error('Failed to update order:', err.message);
        }

        res.status(200).json({
            success: true,
            message: 'Payment charged successfully',
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ REFUNDS ============

exports.refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount, reason = 'Full refund' } = req.body;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (!payment.canRefund()) {
            return res.status(400).json({
                success: false,
                message: `Cannot refund payment with status: ${payment.status}`,
            });
        }

        // Determine if full or partial refund
        const refundAmount = amount || payment.amount;
        const remainingBalance = payment.getRemainingBalance();

        if (refundAmount > remainingBalance) {
            return res.status(400).json({
                success: false,
                message: `Refund amount exceeds remaining balance of ${remainingBalance}`,
            });
        }

        // Create refund record
        const refund = {
            amount: refundAmount,
            reason,
            status: 'pending',
            initiatedAt: new Date(),
        };

        payment.refunds.push(refund);

        // Update payment status
        const totalRefunded = payment.getTotalRefunded() + refundAmount;
        if (totalRefunded === payment.amount) {
            payment.status = 'refunded';
        } else if (totalRefunded > 0) {
            payment.status = 'partial_refund';
        }

        // Create transaction record
        const transaction = new Transaction({
            paymentId,
            type: refundAmount === payment.amount ? 'refund' : 'partial_refund',
            amount: refundAmount,
            currency: payment.currency,
            status: 'success',
            description: reason,
            authorizationCode: `REFUND_${Date.now()}`,
        });

        await transaction.save();
        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Refund initiated successfully',
            data: {
                paymentId,
                refundId: refund.refundId || refund._id,
                amount: refundAmount,
                status: payment.status,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ PAYMENT RETRIEVAL ============

exports.getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment.findOne({ paymentId, isActive: true });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPaymentByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOne({ orderId, isActive: true });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found for this order',
            });
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId, isActive: true };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: payments,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ TRANSACTION LOGS ============

exports.getTransactionHistory = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        const skip = (page - 1) * limit;
        const transactions = await Transaction.find({ paymentId })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments({ paymentId });

        res.status(200).json({
            success: true,
            paymentId,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: transactions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type, processor } = req.query;

        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (processor) query.processor = processor;

        const skip = (page - 1) * limit;
        const transactions = await Transaction.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: transactions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ INVOICES ============

exports.generateInvoice = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { dueDate, items } = req.body;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const invoice = new Invoice({
            paymentId,
            orderId: payment.orderId,
            invoiceNumber,
            items: items || [],
            subtotal: payment.amountBreakdown?.subtotal || 0,
            tax: payment.amountBreakdown?.tax || 0,
            discount: payment.amountBreakdown?.discount || 0,
            total: payment.amount,
            dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'sent',
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: invoice,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findOne({ invoiceId });

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            });
        }

        res.status(200).json({
            success: true,
            data: invoice,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPaymentInvoices = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const invoices = await Invoice.find({ paymentId }).sort({ generatedAt: -1 });

        res.status(200).json({
            success: true,
            data: invoices,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ RETRY LOGIC ============

exports.retryPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (!payment.canRetry()) {
            return res.status(400).json({
                success: false,
                message: 'Payment cannot be retried',
                retryCount: payment.retryCount,
            });
        }

        // Simulate retry
        const isSuccessful = Math.random() > 0.15; // 85% success on retry

        payment.retryCount += 1;
        payment.lastRetryAt = new Date();

        if (isSuccessful) {
            payment.status = 'charged';
            payment.chargedAt = new Date();

            const transaction = new Transaction({
                paymentId,
                type: 'retry',
                amount: payment.amount,
                currency: payment.currency,
                status: 'success',
                description: `Payment retry attempt ${payment.retryCount}`,
            });

            await transaction.save();
        } else {
            payment.nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // Retry in 5 minutes

            const transaction = new Transaction({
                paymentId,
                type: 'retry',
                amount: payment.amount,
                currency: payment.currency,
                status: 'failed',
                description: `Payment retry attempt ${payment.retryCount} failed`,
                failureReason: 'Payment declined',
            });

            await transaction.save();
        }

        await payment.save();

        res.status(200).json({
            success: isSuccessful,
            message: isSuccessful ? 'Payment retried successfully' : 'Payment retry failed',
            data: {
                paymentId,
                retryCount: payment.retryCount,
                status: payment.status,
                nextRetryAt: payment.nextRetryAt,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ DISPUTES & CHARGEBACKS ============

exports.openDispute = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason, evidence } = req.body;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        const dispute = {
            reason,
            status: 'opened',
            openedAt: new Date(),
            evidence: evidence || [],
        };

        payment.disputes.push(dispute);
        await payment.save();

        const transaction = new Transaction({
            paymentId,
            type: 'reversal',
            amount: payment.amount,
            currency: payment.currency,
            status: 'pending',
            description: `Dispute opened: ${reason}`,
        });

        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'Dispute opened successfully',
            data: dispute,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.resolveDispute = async (req, res) => {
    try {
        const { paymentId, disputeId } = req.params;
        const { status, evidence } = req.body;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        const dispute = payment.disputes.find((d) => d._id.toString() === disputeId);
        if (!dispute) {
            return res.status(404).json({
                success: false,
                message: 'Dispute not found',
            });
        }

        dispute.status = status;
        dispute.resolvedAt = new Date();
        if (evidence) {
            dispute.evidence = evidence;
        }

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Dispute resolved',
            data: dispute,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ PAYMENT STATISTICS ============

exports.getPaymentStats = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        const query = { isActive: true };
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Count by status
        const totalPayments = await Payment.countDocuments(query);
        const chargedPayments = await Payment.countDocuments({ ...query, status: 'charged' });
        const pendingPayments = await Payment.countDocuments({ ...query, status: 'pending' });
        const failedPayments = await Payment.countDocuments({ ...query, status: 'failed' });
        const refundedPayments = await Payment.countDocuments({ ...query, status: 'refunded' });

        // Revenue calculations
        const revenueAgg = await Payment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    avgAmount: { $avg: '$amount' },
                    minAmount: { $min: '$amount' },
                    maxAmount: { $max: '$amount' },
                },
            },
        ]);

        const revenue = revenueAgg[0] || {
            totalRevenue: 0,
            avgAmount: 0,
            minAmount: 0,
            maxAmount: 0,
        };

        // Refund calculations
        const refundAgg = await Payment.aggregate([
            { $match: query },
            { $unwind: { path: '$refunds', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    totalRefunded: {
                        $sum: {
                            $cond: [
                                { $eq: ['$refunds.status', 'completed'] },
                                '$refunds.amount',
                                0,
                            ],
                        },
                    },
                    refundCount: {
                        $sum: {
                            $cond: [{ $eq: ['$refunds.status', 'completed'] }, 1, 0],
                        },
                    },
                },
            },
        ]);

        const refunds = refundAgg[0] || { totalRefunded: 0, refundCount: 0 };

        res.status(200).json({
            success: true,
            data: {
                payments: {
                    total: totalPayments,
                    charged: chargedPayments,
                    pending: pendingPayments,
                    failed: failedPayments,
                    refunded: refundedPayments,
                },
                revenue: {
                    total: revenue.totalRevenue,
                    average: revenue.avgAmount,
                    min: revenue.minAmount,
                    max: revenue.maxAmount,
                },
                refunds: {
                    totalAmount: refunds.totalRefunded,
                    count: refunds.refundCount,
                },
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ CANCEL PAYMENT ============

exports.cancelPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;

        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (['charged', 'refunded', 'cancelled'].includes(payment.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel payment with status: ${payment.status}`,
            });
        }

        payment.status = 'cancelled';
        payment.cancelledAt = new Date();

        const transaction = new Transaction({
            paymentId,
            type: 'reversal',
            amount: payment.amount,
            currency: payment.currency,
            status: 'success',
            description: reason || 'Payment cancelled',
        });

        await transaction.save();
        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Payment cancelled successfully',
            data: payment,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
