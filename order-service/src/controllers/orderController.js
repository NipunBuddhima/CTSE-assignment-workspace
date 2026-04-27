const Order = require('../models/Order');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001/api/users';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002/api/products';

// ============ ORDER CREATION ============

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

        // Validate required fields
        if (!userId || !items || items.length === 0 || !shippingAddress) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, items, shippingAddress',
            });
        }

        // Verify user exists in user-service
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

        // Verify products exist and get pricing
        const processedItems = [];
        let subtotal = 0;

        for (const item of items) {
            try {
                const productResponse = await axios.get(
                    `${PRODUCT_SERVICE_URL}/id/${item.productId}`
                );
                const product = productResponse.data.data;

                // Check if product is available
                if (!product || !product.isActive) {
                    return res.status(400).json({
                        success: false,
                        message: `Product ${item.productId} is not available`,
                    });
                }

                // Check inventory
                const availableQty = product.inventory.quantity - product.inventory.reserved;
                if (availableQty < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient inventory for product ${product.name}. Available: ${availableQty}`,
                    });
                }

                const itemTotal = product.price.currentPrice * item.quantity;

                processedItems.push({
                    productId: product.productId,
                    sku: product.sku,
                    productName: product.name,
                    quantity: item.quantity,
                    unitPrice: product.price.currentPrice,
                    totalPrice: itemTotal,
                });

                subtotal += itemTotal;
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: `Error retrieving product ${item.productId}`,
                });
            }
        }

        // Reserve inventory for all items
        try {
            for (const item of processedItems) {
                await axios.post(
                    `${PRODUCT_SERVICE_URL}/${item.productId}/reserve`,
                    { quantity: item.quantity }
                );
            }
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to reserve inventory',
                error: err.message,
            });
        }

        // Calculate totals
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
        const total = subtotal + tax + shipping;

        // Create order
        const newOrder = new Order({
            userId,
            userEmail: userData.email,
            items: processedItems,
            summary: {
                subtotal,
                tax,
                shipping,
                discount: 0,
                total,
            },
            status: 'pending',
            statusHistory: [
                {
                    status: 'pending',
                    timestamp: new Date(),
                    notes: 'Order created',
                },
            ],
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            payment: {
                method: paymentMethod || 'credit_card',
                status: 'pending',
            },
            notes,
        });

        await newOrder.save();

        // Add initial tracking event
        newOrder.tracking = {
            currentStatus: 'created',
            events: [
                {
                    event: 'created',
                    timestamp: new Date(),
                    description: 'Order has been created and is pending confirmation',
                },
            ],
        };

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: newOrder,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ ORDER RETRIEVAL ============

exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId, sortBy = 'createdAt' } = req.query;

        const query = { isActive: true };

        if (status) {
            query.status = status;
        }

        if (userId) {
            query.userId = userId;
        }

        const skip = (page - 1) * limit;
        const orders = await Order.find(query)
            .sort({ [sortBy]: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: orders,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId, isActive: true });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId, isActive: true };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.status(200).json({
            success: true,
            userId,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: orders,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ ORDER UPDATES ============

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes, trackingNumber, carrier } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        // Add status to history
        order.addStatusUpdate(status, notes, 'admin');

        // Update tracking information if provided
        if (trackingNumber) {
            order.tracking = order.tracking || {};
            order.tracking.trackingNumber = trackingNumber;
        }
        if (carrier) {
            order.tracking = order.tracking || {};
            order.tracking.carrier = carrier;
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addTrackingEvent = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { event, location, description } = req.body;

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        order.addTrackingEvent(event, location, description);
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Tracking event added',
            data: {
                orderId: order.orderId,
                tracking: order.tracking,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ ORDER CANCELLATION ============

exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        if (!order.isCancellable()) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`,
            });
        }

        // Release inventory for all items
        try {
            for (const item of order.items) {
                await axios.post(
                    `${PRODUCT_SERVICE_URL}/${item.productId}/release`,
                    { quantity: item.quantity }
                );
            }
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to release inventory',
            });
        }

        order.addStatusUpdate('cancelled', reason || 'Order cancelled by user', 'user');
        order.addTrackingEvent('cancelled', null, reason || 'Order has been cancelled');

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ ORDER TRACKING ============

exports.getOrderTracking = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                orderId: order.orderId,
                status: order.status,
                tracking: order.tracking,
                statusHistory: order.statusHistory,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getOrderHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const skip = (page - 1) * limit;
        const orders = await Order.find({ userId, isActive: true })
            .select('orderId status summary.total createdAt statusHistory tracking')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments({ userId, isActive: true });

        const history = orders.map((order) => ({
            orderId: order.orderId,
            status: order.status,
            total: order.summary.total,
            createdAt: order.createdAt,
            lastUpdate: order.statusHistory[order.statusHistory.length - 1]?.timestamp,
            recentEvent: order.tracking?.events[order.tracking.events.length - 1],
        }));

        res.status(200).json({
            success: true,
            userId,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: history,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ ORDER STATISTICS ============

exports.getOrderStats = async (req, res) => {
    try {
        const { userId } = req.query;

        const query = { isActive: true };
        if (userId) {
            query.userId = userId;
        }

        const totalOrders = await Order.countDocuments(query);
        const pendingOrders = await Order.countDocuments({ ...query, status: 'pending' });
        const confirmedOrders = await Order.countDocuments({ ...query, status: 'confirmed' });
        const shippedOrders = await Order.countDocuments({ ...query, status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ ...query, status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ ...query, status: 'cancelled' });

        const totalRevenueAgg = await Order.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$summary.total' },
                    avgOrderValue: { $avg: '$summary.total' },
                },
            },
        ]);

        const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
        const avgOrderValue = totalRevenueAgg[0]?.avgOrderValue || 0;

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                byStatus: {
                    pending: pendingOrders,
                    confirmed: confirmedOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders,
                },
                revenue: {
                    total: totalRevenue,
                    average: avgOrderValue,
                },
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ PAYMENT UPDATES ============

exports.updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus, transactionId } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({
                success: false,
                message: 'Payment status is required',
            });
        }

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        order.payment.status = paymentStatus;
        if (transactionId) {
            order.payment.transactionId = transactionId;
        }

        if (paymentStatus === 'completed') {
            order.payment.paidAt = new Date();
            order.addTrackingEvent('payment_received', null, 'Payment received');
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment status updated',
            data: {
                orderId: order.orderId,
                payment: order.payment,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
