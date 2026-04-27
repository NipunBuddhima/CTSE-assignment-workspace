const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const productController = require('../controllers/productController');

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

// ============ CATALOG ENDPOINTS ============

// GET /api/products - Get all products (with filtering, sorting, pagination)
router.get('/', productController.getAllProducts);

// GET /api/products/id/:productId - Get single product by ID
router.get('/id/:productId', productController.getProductById);

// GET /api/products/sku/:sku - Get product by SKU (for inter-service)
router.get('/sku/:sku', productController.getProductBySku);

// POST /api/products - Create new product
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Product name is required'),
        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required'),
        body('category').trim().notEmpty().withMessage('Category is required'),
        body('price')
            .custom((value) => {
                if (typeof value === 'number') {
                    return value >= 0;
                }
                if (value && typeof value === 'object') {
                    const hasOriginal = typeof value.originalPrice === 'number';
                    const hasCurrent = typeof value.currentPrice === 'number';
                    return hasOriginal || hasCurrent;
                }
                return false;
            })
            .withMessage('Price must be a positive number or object with currentPrice/originalPrice'),
        body('sku').trim().notEmpty().withMessage('SKU is required'),
    ],
    handleValidationErrors,
    productController.createProduct
);

// PUT /api/products/:productId - Update product
router.put(
    '/:productId',
    [
        body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive if provided'),
    ],
    handleValidationErrors,
    productController.updateProduct
);

// DELETE /api/products/:productId - Delete product (soft delete)
router.delete('/:productId', productController.deleteProduct);

// ============ INVENTORY ENDPOINTS ============

// GET /api/products/:productId/inventory - Get inventory details
router.get('/:productId/inventory', productController.getInventory);

// POST /api/products/:productId/restock - Restock product
router.post(
    '/:productId/restock',
    [
        body('quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be a positive integer'),
    ],
    handleValidationErrors,
    productController.restockProduct
);

// POST /api/products/:productId/reserve - Reserve inventory (for orders)
router.post(
    '/:productId/reserve',
    [
        body('quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be a positive integer'),
    ],
    handleValidationErrors,
    productController.reserveInventory
);

// POST /api/products/:productId/release - Release reserved inventory
router.post(
    '/:productId/release',
    [
        body('quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be a positive integer'),
    ],
    handleValidationErrors,
    productController.releaseInventory
);

// POST /api/products/:productId/consume - Consume inventory (order completed)
router.post(
    '/:productId/consume',
    [
        body('quantity')
            .isInt({ min: 1 })
            .withMessage('Quantity must be a positive integer'),
    ],
    handleValidationErrors,
    productController.consumeInventory
);

// GET /api/products/inventory/low-stock - Get low stock products
router.get('/inventory/low-stock', productController.getLowStockProducts);

module.exports = router;
