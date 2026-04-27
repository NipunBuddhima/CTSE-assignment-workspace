const Product = require('../models/Product');

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            search,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            inStock,
        } = req.query;

        const query = { isActive: true };

        // Category filter
        if (category) {
            query.category = category;
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query['price.currentPrice'] = {};
            if (minPrice) query['price.currentPrice'].$gte = parseFloat(minPrice);
            if (maxPrice) query['price.currentPrice'].$lte = parseFloat(maxPrice);
        }

        // Stock filter
        if (inStock === 'true') {
            query['inventory.quantity'] = { $gt: 0 };
        }

        // Sorting
        const sortOptions = {};
        if (sort === 'price-asc') {
            sortOptions['price.currentPrice'] = 1;
        } else if (sort === 'price-desc') {
            sortOptions['price.currentPrice'] = -1;
        } else if (sort === 'rating') {
            sortOptions['rating.averageRating'] = -1;
        } else {
            sortOptions[sort] = -1;
        }

        const skip = (page - 1) * limit;
        const products = await Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            data: products,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ productId, isActive: true });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get product by SKU (for inter-service calls)
exports.getProductBySku = async (req, res) => {
    try {
        const { sku } = req.params;
        const product = await Product.findOne({ sku, isActive: true });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create new product (admin only)
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            sku,
            inventory,
            specifications,
            images,
            tags,
        } = req.body;

        // Validate required fields
        if (!name || !description || !category || !price || !sku) {
            return res
                .status(400)
                .json({ success: false, message: 'Missing required fields' });
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: 'Product with this SKU already exists',
            });
        }

        const newProduct = new Product({
            name,
            description,
            category,
            price: {
                originalPrice: price.originalPrice || price,
                currentPrice: price.currentPrice || price,
                discount: price.discount || 0,
            },
            sku,
            inventory: inventory || { quantity: 0 },
            specifications: specifications || {},
            images: images || [],
            tags: tags || [],
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            name,
            description,
            category,
            price,
            specifications,
            images,
            tags,
            isActive,
        } = req.body;

        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        // Update allowed fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (category) product.category = category;
        if (price) {
            if (price.originalPrice)
                product.price.originalPrice = price.originalPrice;
            if (price.currentPrice) product.price.currentPrice = price.currentPrice;
            if (price.discount !== undefined) product.price.discount = price.discount;
        }
        if (specifications) product.specifications = specifications;
        if (images) product.images = images;
        if (tags) product.tags = tags;
        if (isActive !== undefined) product.isActive = isActive;

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete product (soft delete - mark as inactive)
exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        product.isActive = false;
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ============ INVENTORY OPERATIONS ============

// Get product inventory details
exports.getInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                productId: product.productId,
                name: product.name,
                sku: product.sku,
                inventory: {
                    quantity: product.inventory.quantity,
                    reserved: product.inventory.reserved,
                    available: product.getAvailableQuantity(),
                    warehouse: product.inventory.warehouse,
                    reorderLevel: product.inventory.reorderLevel,
                    isLowOnStock: product.isLowOnStock(),
                },
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Restock product
exports.restockProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number',
            });
        }

        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        const oldQuantity = product.inventory.quantity;
        product.updateInventory(quantity);
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product restocked successfully',
            data: {
                productId: product.productId,
                sku: product.sku,
                oldQuantity,
                newQuantity: product.inventory.quantity,
                added: quantity,
                available: product.getAvailableQuantity(),
                lastRestocked: product.inventory.lastRestocked,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Reserve inventory (for orders)
exports.reserveInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number',
            });
        }

        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        if (product.getAvailableQuantity() < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient available inventory',
                available: product.getAvailableQuantity(),
                requested: quantity,
            });
        }

        product.reserveQuantity(quantity);
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Inventory reserved successfully',
            data: {
                productId: product.productId,
                sku: product.sku,
                reserved: quantity,
                totalReserved: product.inventory.reserved,
                available: product.getAvailableQuantity(),
                quantity: product.inventory.quantity,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Release inventory (order cancelled)
exports.releaseInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number',
            });
        }

        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        if (product.inventory.reserved < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Cannot release more than reserved',
                currentlyReserved: product.inventory.reserved,
                requestedRelease: quantity,
            });
        }

        product.releaseReservation(quantity);
        await product.save();

        res.status(200).json({
            success: true,
            message: 'Inventory released successfully',
            data: {
                productId: product.productId,
                sku: product.sku,
                released: quantity,
                totalReserved: product.inventory.reserved,
                available: product.getAvailableQuantity(),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Consume inventory (order completed)
exports.consumeInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive number',
            });
        }

        const product = await Product.findOne({ productId });

        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }

        if (product.inventory.reserved < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient reserved inventory',
            });
        }

        // Reduce both quantity and reserved
        product.inventory.quantity -= quantity;
        product.inventory.reserved -= quantity;

        if (product.inventory.quantity < 0) {
            product.inventory.quantity = 0;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Inventory consumed successfully',
            data: {
                productId: product.productId,
                sku: product.sku,
                consumed: quantity,
                remaining: product.inventory.quantity,
                reserved: product.inventory.reserved,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ['$inventory.quantity', '$inventory.reorderLevel'] },
        }).sort({ 'inventory.quantity': 1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products.map((p) => ({
                productId: p.productId,
                name: p.name,
                sku: p.sku,
                quantity: p.inventory.quantity,
                reorderLevel: p.inventory.reorderLevel,
                isLowOnStock: p.isLowOnStock(),
            })),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
