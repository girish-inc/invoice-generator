import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Ensure invoices directory exists
const invoicesDir = path.join(process.cwd(), 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

// POST /api/pdf/generate - Generate PDF invoice
router.post('/generate', auth, async (req: Request, res: Response) => {
  try {
    // Get data from request body
    const { products, subtotal, gst, grandTotal } = req.body;
    
    // Validate required data
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products data is required' });
    }
    
    const invoiceData = {
      invoiceNumber: 'INV-' + Date.now(),
      date: new Date().toLocaleDateString(),
      companyName: 'Your Company Name',
      companyAddress: '123 Business Street\nCity, State 12345\nPhone: (555) 123-4567',
      clientName: 'Client Name',
      clientAddress: '456 Client Avenue\nClient City, State 67890',
      products: products.map((product: any) => ({
        name: product.name,
        qty: product.quantity,
        rate: product.rate,
        total: product.quantity * product.rate
      })),
      subtotal: subtotal || 0,
      tax: gst || 0,
      total: grandTotal || 0
    };

    // HTML template for PDF
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
        }
        .invoice-info {
          text-align: right;
        }
        .invoice-number {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .date {
          color: #666;
        }
        .addresses {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .address-block {
          width: 45%;
        }
        .address-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #007bff;
        }
        .address-content {
          white-space: pre-line;
          line-height: 1.4;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .products-table th,
        .products-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        .products-table th {
          background-color: #007bff;
          color: white;
          font-weight: bold;
        }
        .products-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          width: 300px;
          margin-left: auto;
          border-collapse: collapse;
        }
        .totals td {
          padding: 8px 12px;
          border-bottom: 1px solid #ddd;
        }
        .totals .total-row {
          font-weight: bold;
          background-color: #007bff;
          color: white;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">📄 INVOICE GENERATOR</div>
        <div class="invoice-info">
          <div class="invoice-number">${invoiceData.invoiceNumber}</div>
          <div class="date">${invoiceData.date}</div>
        </div>
      </div>

      <div class="addresses">
        <div class="address-block">
          <div class="address-title">From:</div>
          <div class="address-content">${invoiceData.companyName}
${invoiceData.companyAddress}</div>
        </div>
        <div class="address-block">
          <div class="address-title">To:</div>
          <div class="address-content">${invoiceData.clientName}
${invoiceData.clientAddress}</div>
        </div>
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.products.map(product => `
            <tr>
              <td>${product.name}</td>
              <td class="text-right">${product.qty}</td>
              <td class="text-right">$${product.rate.toFixed(2)}</td>
              <td class="text-right">$${product.total.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table class="totals">
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">$${invoiceData.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Tax (10%):</td>
          <td class="text-right">$${invoiceData.tax.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Total:</td>
          <td class="text-right">$${invoiceData.total.toFixed(2)}</td>
        </tr>
      </table>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate);
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Save PDF to invoices directory
    const filename = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
    const filepath = path.join(invoicesDir, filename);
    fs.writeFileSync(filepath, pdfBuffer);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

export default router;