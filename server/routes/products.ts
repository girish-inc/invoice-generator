import express, { Request, Response } from 'express';
import Product from '../models/productModel.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/products - Get all products for authenticated user
router.get('/', auth, async (req: Request, res: Response) => {
  console.log('GET /api/products - Request received');
  console.log('User:', (req as any).user);
  try {
    // For testing without MongoDB, return mock response
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost:27017')) {
      const mockProducts = [
        {
          id: 'mock_product_1',
          name: 'Sample Product 1',
          qty: 2,
          rate: 25.50,
          userId: (req as any).user?._id || 'mock_user',
          createdAt: new Date()
        },
        {
          id: 'mock_product_2',
          name: 'Sample Product 2',
          qty: 1,
          rate: 15.00,
          userId: (req as any).user?._id || 'mock_user',
          createdAt: new Date()
        }
      ];

      return res.status(200).json({
        message: 'Products retrieved successfully (test mode)',
        products: mockProducts
      });
    }

    // Get products from database
    const products = await Product.find({ userId: (req as any).user._id });

    res.status(200).json({
      message: 'Products retrieved successfully',
      products: products.map(product => ({
        id: product._id,
        name: product.name,
        qty: product.qty,
        rate: product.rate,
        userId: product.userId
      }))
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/products - Save a product
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const { name, qty, rate } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.length < 3 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 3 and 50 characters' });
    }

    if (!qty || typeof qty !== 'number' || qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a number greater than 0' });
    }

    if (!rate || typeof rate !== 'number' || rate <= 0) {
      return res.status(400).json({ message: 'Rate must be a number greater than 0' });
    }

    // For testing without MongoDB, return mock response
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost:27017')) {
      const mockProduct = {
        id: 'mock_product_' + Date.now(),
        name,
        qty,
        rate,
        userId: (req as any).user?._id || 'mock_user',
        createdAt: new Date()
      };

      return res.status(201).json({
        message: 'Product saved successfully (test mode)',
        product: mockProduct
      });
    }

    // Create new product
    const product = new Product({
      name,
      qty,
      rate,
      userId: (req as any).user._id
    });

    await product.save();

    res.status(201).json({
      message: 'Product saved successfully',
      product: {
        id: product._id,
        name: product.name,
        qty: product.qty,
        rate: product.rate,
        userId: product.userId
      }
    });
  } catch (error) {
    console.error('Product save error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/products/:id - Delete a specific product
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // For testing without MongoDB, return mock response
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost:27017')) {
      return res.status(200).json({
        message: 'Product deleted successfully (test mode)',
        productId: id
      });
    }

    // Find and delete the product
    const product = await Product.findOneAndDelete({ 
      _id: id, 
      userId: (req as any).user._id 
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
      productId: id
    });
  } catch (error) {
    console.error('Product delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;