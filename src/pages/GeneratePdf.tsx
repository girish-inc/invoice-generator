// import React from 'react'; // Removed unused import
import { useAppSelector } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Calculator } from 'lucide-react';
import { useGeneratePDF } from '../hooks/useQuery';

const GeneratePdf = () => {
  const products = useAppSelector((state) => state.products.products);
  const generatePDFMutation = useGeneratePDF();

  // Debug: Log products data
  console.log('Products in GeneratePdf:', products);
  products.forEach((product, index) => {
    console.log(`Product ${index}:`, {
      name: product.name,
      quantity: product.quantity,
      rate: product.rate,
      quantityType: typeof product.quantity,
      rateType: typeof product.rate,
      calculation: product.quantity * product.rate
    });
  });

  // Calculate totals
  const subtotal = products.reduce((sum, product) => {
    const productTotal = (product.quantity || 0) * (product.rate || 0);
    console.log(`Product total for ${product.name}:`, productTotal);
    return sum + productTotal;
  }, 0);
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  const handleGeneratePdf = async () => {
    try {
      const pdfData = await generatePDFMutation.mutateAsync({
        products,
        subtotal,
        gst,
        grandTotal,
      });

      // Create blob from the response data
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('PDF generated successfully');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--figma-white)' }}>
      <div className="form-container section-spacing">
        <div className="mb-8">
          <h1 className="heading-primary mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Generate PDF Invoice
          </h1>
          <p className="text-gray-600">Review your products and generate a professional PDF invoice</p>
        </div>

        {products.length === 0 ? (
          <Card className="form-card">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 text-lg">No products added yet.</p>
              <p className="text-gray-400 mt-2">Please add products first to generate an invoice.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Products Summary */}
            <Card className="form-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Invoice Summary
                </CardTitle>
                <CardDescription>
                  {products.length} product{products.length !== 1 ? 's' : ''} ready for invoice generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Rate</th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">{product.name}</td>
                            <td className="py-3 px-4 text-right text-gray-700">{product.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-700">₹{product.rate.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">
                              ₹{((product.quantity || 0) * (product.rate || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>GST (18%):</span>
                        <span>₹{gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                        <span>Grand Total:</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate PDF Button */}
            <div className="nav-container">
              <Button
                onClick={handleGeneratePdf}
                className="btn-primary flex items-center gap-2"
                disabled={generatePDFMutation.isPending}
              >
                {generatePDFMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Generate & Download PDF
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeneratePdf;