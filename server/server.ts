import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Invoice from './models/invoiceModel.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import pdfRoutes from './routes/pdf.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT: string | number = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pdf', pdfRoutes);

// Connect to MongoDB
connectDB().then(() => {
  console.log('Server connected');
}).catch((error: Error) => {
  console.error('Failed to connect to database:', error);
  console.log('Continuing without database connection for testing...');
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Invoice Generator API is running!' });
});

// Global error handler middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Global error handler:', err);
  
  // Default to 500 server error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value';
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;