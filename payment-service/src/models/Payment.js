const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Transaction Log Schema
const transactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        paymentId: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['charge', 'refund', 'partial_refund', 'retry', 'reversal'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative'],
        },
        currency: {
            type: String,
            default: 'USD',
        },
        status: {
            type: String,
            enum: ['pending', 'success', 'failed', 'cancelled'],
            default: 'pending',
        },
        processor: {
            type: String,
            enum: ['stripe', 'paypal', 'square', 'manual'],
            default: 'stripe',
        },
        processorReference: String,
        authorizationCode: String,
        description: String,
        failureReason: String,
        metadata: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false }
);

// Invoice Schema
const invoiceSchema = new mongoose.Schema(
    {
        invoiceId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        paymentId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        invoiceNumber: {
            type: String,
            unique: true,
        },
        items: [
            {
                description: String,
                quantity: Number,
                unitPrice: Number,
                totalPrice: Number,
            },
        ],
        subtotal: Number,
        tax: Number,
        discount: Number,
        total: Number,
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        dueDate: Date,
        paidAt: Date,
        status: {
            type: String,
            enum: ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'],
            default: 'draft',
        },
    },
    { timestamps: true }
);

// Main Payment Schema
const paymentSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        orderId: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        userEmail: String,
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative'],
        },
        currency: {
            type: String,
            default: 'USD',
        },
        status: {
            type: String,
            enum: [
                'pending',
                'authorized',
                'charged',
                'refunded',
                'partial_refund',
                'failed',
                'cancelled',
            ],
            default: 'pending',
            index: true,
        },
        paymentMethod: {
            type: {
                type: String,
                enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'digital_wallet'],
                required: true,
            },
            last4: String,
            brand: String, // visa, mastercard, amex, etc.
            expiryMonth: Number,
            expiryYear: Number,
            cardHolder: String,
            bankAccount: String,
            bankRouting: String,
            billingZip: String,
            country: String,
        },
        processor: {
            type: String,
            enum: ['stripe', 'paypal', 'square', 'manual'],
            default: 'stripe',
        },
        processorPaymentId: String,
        processorCustomerId: String,
        description: String,

        // Amount breakdown
        amountBreakdown: {
            subtotal: Number,
            tax: Number,
            shipping: Number,
            discount: Number,
            total: Number,
        },

        // Refund tracking
        refunds: [
            {
                refundId: {
                    type: String,
                    default: uuidv4,
                },
                amount: Number,
                reason: String,
                status: {
                    type: String,
                    enum: ['pending', 'completed', 'failed'],
                    default: 'pending',
                },
                initiatedAt: {
                    type: Date,
                    default: Date.now,
                },
                completedAt: Date,
                processorRefundId: String,
            },
        ],

        // Retry logic
        retryCount: {
            type: Number,
            default: 0,
        },
        lastRetryAt: Date,
        nextRetryAt: Date,

        // Dispute/Chargeback
        disputes: [
            {
                disputeId: {
                    type: String,
                    default: uuidv4,
                },
                reason: String,
                status: {
                    type: String,
                    enum: ['opened', 'under_review', 'won', 'lost', 'resolved'],
                    default: 'opened',
                },
                openedAt: {
                    type: Date,
                    default: Date.now,
                },
                resolvedAt: Date,
                evidence: [String],
            },
        ],

        // Billing details
        billingAddress: {
            fullName: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },

        // Additional metadata
        metadata: mongoose.Schema.Types.Mixed,
        notes: String,
        tags: [String],

        // Timestamps
        createdAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        authorizedAt: Date,
        chargedAt: Date,
        failedAt: Date,
        cancelledAt: Date,
        isActive: {
            type: Boolean,
            default: true,
        },

        // Soft delete
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes
paymentSchema.index({ orderId: 1, userId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ processor: 1, processorPaymentId: 1 });

// Instance methods
paymentSchema.methods.getTransactionHistory = function () {
    return this.transactions || [];
};

paymentSchema.methods.canRefund = function () {
    return (
        this.status === 'charged' ||
        this.status === 'authorized' ||
        this.status === 'partial_refund'
    );
};

paymentSchema.methods.getTotalRefunded = function () {
    return this.refunds.reduce((total, refund) => {
        if (refund.status === 'completed') {
            return total + refund.amount;
        }
        return total;
    }, 0);
};

paymentSchema.methods.getRemainingBalance = function () {
    return this.amount - this.getTotalRefunded();
};

paymentSchema.methods.canRetry = function () {
    return this.status === 'failed' && this.retryCount < 3;
};

paymentSchema.methods.toJSON = function () {
    const obj = this.toObject();
    // Mask sensitive card data
    if (obj.paymentMethod && obj.paymentMethod.expiryMonth) {
        obj.paymentMethod.expiryMonth = undefined;
        obj.paymentMethod.expiryYear = undefined;
    }
    return obj;
};

const Payment = mongoose.model('Payment', paymentSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = { Payment, Transaction, Invoice };
