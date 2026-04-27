require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/product-service';

const sampleProducts = [
    {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
        category: 'Electronics',
        price: { originalPrice: 249.99, currentPrice: 199.99, discount: 20 },
        sku: 'ELEC-HEAD-001',
        inventory: { quantity: 42, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 10 },
        specifications: { brand: 'SoundWave', color: 'Matte Black', material: 'Aluminum' },
        images: [],
        tags: ['audio', 'wireless', 'headphones']
    },
    {
        name: 'Smart Fitness Watch Pro',
        description: 'Track heart rate, sleep, and workouts with GPS and waterproof design.',
        category: 'Electronics',
        price: { originalPrice: 179.99, currentPrice: 149.99, discount: 17 },
        sku: 'ELEC-WATCH-002',
        inventory: { quantity: 30, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 8 },
        specifications: { brand: 'FitCore', color: 'Graphite', material: 'Silicone' },
        images: [],
        tags: ['watch', 'fitness', 'wearable']
    },
    {
        name: 'Classic Cotton Hoodie',
        description: 'Soft, breathable hoodie made from 100% premium cotton.',
        category: 'Clothing',
        price: { originalPrice: 59.99, currentPrice: 44.99, discount: 25 },
        sku: 'CLOT-HOOD-003',
        inventory: { quantity: 85, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 15 },
        specifications: { brand: 'UrbanWeave', color: 'Navy', material: 'Cotton' },
        images: [],
        tags: ['hoodie', 'casual', 'cotton']
    },
    {
        name: 'Ergonomic Office Chair',
        description: 'Adjustable lumbar support chair designed for all-day comfort.',
        category: 'Home & Garden',
        price: { originalPrice: 299.99, currentPrice: 239.99, discount: 20 },
        sku: 'HOME-CHAI-004',
        inventory: { quantity: 18, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 5 },
        specifications: { brand: 'ComfortEdge', color: 'Charcoal', material: 'Mesh' },
        images: [],
        tags: ['office', 'chair', 'ergonomic']
    },
    {
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated 1L bottle that keeps drinks cold for 24 hours.',
        category: 'Sports',
        price: { originalPrice: 34.99, currentPrice: 24.99, discount: 29 },
        sku: 'SPRT-BOTT-005',
        inventory: { quantity: 120, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 20 },
        specifications: { brand: 'HydroPeak', color: 'Silver', material: 'Steel' },
        images: [],
        tags: ['bottle', 'hydration', 'outdoor']
    },
    {
        name: 'Bestselling Productivity Book',
        description: 'Practical strategies to build focus, consistency, and high-performance habits.',
        category: 'Books',
        price: { originalPrice: 24.99, currentPrice: 18.99, discount: 24 },
        sku: 'BOOK-PROD-006',
        inventory: { quantity: 65, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 10 },
        specifications: { brand: 'MindPress', color: 'Paperback', material: 'Paper' },
        images: [],
        tags: ['book', 'productivity', 'learning']
    },
    {
        name: 'Vitamin C Face Serum',
        description: 'Brightening serum with hyaluronic acid for daily skin hydration.',
        category: 'Beauty',
        price: { originalPrice: 39.99, currentPrice: 29.99, discount: 25 },
        sku: 'BEAU-SERU-007',
        inventory: { quantity: 54, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 12 },
        specifications: { brand: 'GlowLab', color: 'Amber', material: 'Glass Bottle' },
        images: [],
        tags: ['skincare', 'serum', 'beauty']
    },
    {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB mechanical keyboard with tactile switches and aluminum frame.',
        category: 'Electronics',
        price: { originalPrice: 129.99, currentPrice: 99.99, discount: 23 },
        sku: 'ELEC-KEYB-008',
        inventory: { quantity: 26, reserved: 0, warehouse: 'Main Warehouse', reorderLevel: 6 },
        specifications: { brand: 'KeyForge', color: 'Black', material: 'Aluminum' },
        images: [],
        tags: ['keyboard', 'gaming', 'rgb']
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        const existingCount = await Product.countDocuments({});

        if (existingCount > 0) {
            console.log(`Seed skipped: ${existingCount} products already exist.`);
            process.exit(0);
        }

        await Product.insertMany(sampleProducts);
        console.log(`Seed complete: inserted ${sampleProducts.length} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exit(1);
    }
}

seedProducts();
