const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
    sku: String,
    productName: String,
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    totalPrice: {
        type: Number,
        required: true,
    },
});

const orderStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    notes: String,
    updatedBy: String,
});

const orderTrackingSchema = new mongoose.Schema({
    event: {
        type: String,
        enum: ['created', 'confirmed', 'payment_received', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    location: String,
    description: String,
});

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        userEmail: String,
        items: [orderItemSchema],
        summary: {
            subtotal: {
                type: Number,
                default: 0,
            },
            tax: {
                type: Number,
                default: 0,
            },
            shipping: {
                type: Number,
                default: 0,
            },
            discount: {
                type: Number,
                default: 0,
            },
            total: {
                type: Number,
                required: true,
            },
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
            index: true,
        },
        statusHistory: [orderStatusSchema],
        tracking: {
            currentStatus: String,
            estimatedDelivery: Date,
            trackingNumber: String,
            carrier: String,
            events: [orderTrackingSchema],
        },
        shippingAddress: {
            fullName: String,
            email: String,
            phone: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        billingAddress: {
            fullName: String,
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        payment: {
            method: {
                type: String,
                enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'other'],
            },
            status: {
                type: String,
                enum: ['pending', 'completed', 'failed', 'refunded'],
                default: 'pending',
            },
            transactionId: String,
            paidAt: Date,
            refundedAt: Date,
            refundAmount: Number,
        },
        notes: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate subtotal
orderSchema.methods.calculateSubtotal = function () {
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
};

// Calculate total with tax and shipping
orderSchema.methods.calculateTotal = function () {
    const subtotal = this.calculateSubtotal();
    const tax = subtotal * (this.summary.tax ? 0.1 : 0); // Default 10% tax if enabled
    const total = subtotal + tax + this.summary.shipping - this.summary.discount;
    return total;
};

// Add status update to history
orderSchema.methods.addStatusUpdate = function (newStatus, notes, updatedBy) {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        notes,
        updatedBy,
    });
};

// Add tracking event
orderSchema.methods.addTrackingEvent = function (event, location, description) {
    if (!this.tracking) {
        this.tracking = { events: [] };
    }
    this.tracking.events.push({
        event,
        timestamp: new Date(),
        location,
        description,
    });
    this.tracking.currentStatus = event;
};

// Check if order is cancellable
orderSchema.methods.isCancellable = function () {
    return this.status === 'pending' || this.status === 'confirmed';
};

// Format for response
orderSchema.methods.toJSON = function () {
    const obj = this.toObject();
    return obj;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
