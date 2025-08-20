# Invoice Generator - Product Specification Document

## 1. Product Overview

### 1.1 Product Name
Invoice Generator

### 1.2 Product Purpose
A comprehensive web-based application that enables users to create, manage, and generate professional PDF invoices. The system provides a streamlined workflow for product management and invoice generation with automated calculations and professional formatting.

### 1.3 Target Users
- Small business owners
- Freelancers
- Service providers
- Anyone needing to generate professional invoices

### 1.4 Key Value Proposition
- Simplified invoice creation process
- Professional PDF generation
- Automated tax calculations
- User-friendly interface
- Secure user authentication

## 2. Core Features

### 2.1 User Authentication & Management
- **User Registration**: New users can create accounts with name, email, and password
- **User Login**: Secure authentication using JWT tokens
- **Session Management**: 24-hour token expiration for security
- **Email Validation**: Built-in email format validation
- **Password Security**: Bcrypt hashing for password protection

### 2.2 Product Management
- **Add Products**: Users can add products with name, quantity, and rate
- **Product Storage**: Products are stored in Redux state for session persistence
- **Product Validation**: Form validation for required fields
- **Product Display**: Tabular view of all added products

### 2.3 Invoice Generation
- **Invoice Preview**: Real-time calculation and preview of invoice totals
- **Automated Calculations**: 
  - Subtotal calculation (quantity × rate for each product)
  - GST calculation (18% tax rate)
  - Grand total calculation (subtotal + GST)
- **Professional PDF Generation**: 
  - Company branding and logo
  - Invoice numbering (INV-timestamp format)
  - Date stamping
  - Professional styling and layout
  - Responsive table format

### 2.4 PDF Download & Management
- **Instant Download**: Generated PDFs are immediately downloadable
- **File Storage**: PDFs are saved to server's invoices directory
- **Unique Naming**: Each PDF has a unique filename with timestamp
- **Professional Formatting**: A4 format with proper margins and styling

## 3. Technical Architecture

### 3.1 Frontend Technology Stack
- **Framework**: React 19.1.1 with TypeScript
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router DOM for navigation
- **UI Components**: Shadcn/UI with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: TanStack Query for API calls
- **Icons**: Lucide React icon library

### 3.2 Backend Technology Stack
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **PDF Generation**: Puppeteer for HTML-to-PDF conversion
- **CORS**: Configured for cross-origin requests

### 3.3 Development Tools
- **Build Tool**: Vite for fast development and building
- **Linting**: ESLint with TypeScript support
- **Package Manager**: NPM
- **Environment Management**: Dotenv for configuration

## 4. Data Models

### 4.1 User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // Hashed
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 Product Model (Frontend State)
```typescript
interface Product {
  name: string;
  quantity: number;
  rate: number;
}
```

### 4.3 Invoice Model
```typescript
interface Invoice {
  _id: string;
  userId: string;
  products: Product[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.4 Invoice Data Structure (PDF Generation)
```typescript
interface InvoiceData {
  invoiceNumber: string;
  date: string;
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientAddress: string;
  products: ProductLine[];
  subtotal: number;
  tax: number;
  total: number;
}
```

## 5. API Endpoints

### 5.1 Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### 5.2 Product Routes
- Products are managed in frontend state (Redux)
- No dedicated backend API for products

### 5.3 PDF Generation Routes
- `POST /api/pdf/generate` - Generate and download PDF invoice

### 5.4 Health Check
- `GET /` - API health check endpoint

## 6. User Workflows

### 6.1 User Registration Flow
1. User navigates to registration page
2. Fills out name, email, and password
3. System validates input and creates account
4. User receives JWT token and is logged in
5. Redirected to product management

### 6.2 Invoice Creation Flow
1. User logs in to the application
2. Navigates to "Add Products" page
3. Adds products with name, quantity, and rate
4. Products are stored in Redux state
5. Navigates to "Generate PDF" page
6. Reviews invoice summary with calculated totals
7. Clicks "Generate & Download PDF"
8. System generates PDF and initiates download

### 6.3 Product Management Flow
1. User accesses product addition form
2. Enters product details (name, quantity, rate)
3. Form validation ensures all fields are completed
4. Product is added to Redux store
5. User can add multiple products
6. Products persist during session

## 7. Business Rules

### 7.1 Calculation Rules
- **Product Total**: Quantity × Rate
- **Subtotal**: Sum of all product totals
- **GST**: 18% of subtotal
- **Grand Total**: Subtotal + GST

### 7.2 Validation Rules
- **Email**: Must be valid email format
- **Password**: Required for registration/login
- **Product Name**: Required, non-empty string
- **Quantity**: Required, positive number
- **Rate**: Required, positive number

### 7.3 Security Rules
- **JWT Expiration**: 24 hours
- **Password Hashing**: Bcrypt with 10 salt rounds
- **CORS**: Restricted to specific origins
- **Authentication**: Required for PDF generation

## 8. UI/UX Design Principles

### 8.1 Design System
- **Color Scheme**: Professional blue (#007bff) with neutral grays
- **Typography**: Arial/system fonts for readability
- **Layout**: Clean, card-based design with proper spacing
- **Responsive**: Mobile-friendly design patterns

### 8.2 User Experience
- **Navigation**: Simple routing between key pages
- **Feedback**: Loading states and error handling
- **Accessibility**: Semantic HTML and proper labeling
- **Performance**: Optimized with React Query caching

## 9. Deployment Architecture

### 9.1 Frontend Deployment (Vercel)
- **Platform**: Vercel for static site hosting
- **Build Command**: `npm run build`
- **Environment Variables**: `VITE_API_URL`
- **Domain**: Custom domain support

### 9.2 Backend Deployment (Render)
- **Platform**: Render for Node.js hosting
- **Build Command**: `npm ci && npm run build:server`
- **Start Command**: `node dist/server.js`
- **Environment Variables**: `JWT_SECRET`, `MONGO_URI`, `FRONTEND_URL`

### 9.3 Database
- **MongoDB**: Cloud-hosted database
- **Connection**: Mongoose ODM with connection pooling
- **Fallback**: Test mode for development without database

## 10. Security Considerations

### 10.1 Authentication Security
- JWT tokens with expiration
- Secure password hashing
- Protected API routes

### 10.2 Data Security
- Input validation and sanitization
- CORS configuration
- Environment variable protection

### 10.3 File Security
- PDF generation in isolated environment
- Temporary file cleanup
- Secure file serving

## 11. Performance Considerations

### 11.1 Frontend Performance
- React Query for efficient data fetching
- Redux for optimized state management
- Vite for fast development and building
- Code splitting and lazy loading

### 11.2 Backend Performance
- Express.js for lightweight server
- Puppeteer optimization for PDF generation
- MongoDB indexing for user queries
- Connection pooling for database

## 12. Future Enhancements

### 12.1 Potential Features
- **Invoice Templates**: Multiple design options
- **Client Management**: Store and manage client information
- **Invoice History**: View and manage past invoices
- **Payment Integration**: Online payment processing
- **Multi-currency Support**: International business support
- **Recurring Invoices**: Automated invoice generation
- **Analytics Dashboard**: Business insights and reporting

### 12.2 Technical Improvements
- **Testing**: Unit and integration test coverage
- **Monitoring**: Application performance monitoring
- **Caching**: Redis for session and data caching
- **Email**: Automated invoice delivery
- **Mobile App**: Native mobile applications

## 13. Success Metrics

### 13.1 User Metrics
- User registration and retention rates
- Invoice generation frequency
- User session duration
- Feature adoption rates

### 13.2 Technical Metrics
- Application uptime and reliability
- PDF generation success rate
- API response times
- Error rates and resolution times

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared By**: Development Team  
**Status**: Production Ready