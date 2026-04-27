const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        price: {
            originalPrice: {
                type: Number,
                required: true,
                min: [0, 'Original price must be non-negative'],
            },
            currentPrice: {
                type: Number,
                required: true,
                min: [0, 'Current price must be non-negative'],
            },
            discount: {
                type: Number,
                default: 0,
                min: [0, 'Discount must be non-negative'],
                max: [100, 'Discount cannot exceed 100'],
            },
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        inventory: {
            quantity: {
                type: Number,
                required: true,
                default: 0,
                min: [0, 'Quantity cannot be negative'],
            },
            reserved: {
                type: Number,
                default: 0,
                min: [0, 'Reserved count cannot be negative'],
            },
            warehouse: {
                type: String,
                default: 'Main Warehouse',
            },
            lastRestocked: {
                type: Date,
                default: Date.now,
            },
            reorderLevel: {
                type: Number,
                default: 10,
                min: [0, 'Reorder level must be non-negative'],
            },
        },
        specifications: {
            weight: String,
            dimensions: {
                length: String,
                width: String,
                height: String,
            },
            material: String,
            color: String,
            brand: String,
        },
        images: [
            {
                url: String,
                alt: String,
                isPrimary: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        rating: {
            averageRating: {
                type: Number,
                default: 0,
                min: [0, 'Rating must be between 0 and 5'],
                max: [5, 'Rating must be between 0 and 5'],
            },
            reviewCount: {
                type: Number,
                default: 0,
            },
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        tags: [String],
    },
    {
        timestamps: true,
    }
);

// Calculate available quantity (quantity - reserved)
productSchema.methods.getAvailableQuantity = function () {
    return Math.max(0, this.inventory.quantity - this.inventory.reserved);
};

// Check if product is low on stock
productSchema.methods.isLowOnStock = function () {
    return this.inventory.quantity <= this.inventory.reorderLevel;
};

// Update inventory quantity
productSchema.methods.updateInventory = function (amount) {
    this.inventory.quantity += amount;
    if (this.inventory.quantity < 0) {
        throw new Error('Insufficient inventory');
    }
    if (amount > 0) {
        this.inventory.lastRestocked = Date.now();
    }
    return this.inventory.quantity;
};

// Reserve quantity (for orders)
productSchema.methods.reserveQuantity = function (amount) {
    if (this.getAvailableQuantity() < amount) {
        throw new Error('Insufficient available quantity');
    }
    this.inventory.reserved += amount;
    return this.inventory.reserved;
};

// Release reserved quantity (order cancelled)
productSchema.methods.releaseReservation = function (amount) {
    this.inventory.reserved -= amount;
    if (this.inventory.reserved < 0) {
        this.inventory.reserved = 0;
    }
    return this.inventory.reserved;
};

// Exclude sensitive fields from JSON output
productSchema.methods.toJSON = function () {
    const obj = this.toObject();
    return obj;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
