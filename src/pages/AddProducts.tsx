import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Trash2, Plus, Calculator } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { useCreateProduct } from '../hooks/useQuery';
import { addProductSuccess, clearProducts } from '../store/productsSlice';
import { useToast } from '../components/Toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  description: z.string().optional(),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0.01, 'Rate must be greater than 0'),
});

const productsFormSchema = z.object({
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

// Removed unused LocalProduct interface

const AddProducts: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  
  // TanStack Query hooks
  // Removed useProducts() to prevent automatic fetching that overwrites Redux state
  const createProductMutation = useCreateProduct();
  
  // Redux state - commented out unused variables
  // const { products: reduxProducts, isLoading: isReduxLoading, error: reduxError } = useAppSelector((state) => state.products);
  
  const form = useForm<z.infer<typeof productsFormSchema>>({
    resolver: zodResolver(productsFormSchema),
    defaultValues: {
      products: [{ name: '', description: '', qty: 1, rate: 0 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'products',
  });

  const calculateTotal = (qty: number, rate: number): number => {
    return qty * rate;
  };

  const calculateSubtotal = (): number => {
    const products = form.getValues('products');
    return products.reduce((sum, product) => sum + calculateTotal(product.qty, product.rate), 0);
  };

  



  // Removed useEffect that referenced apiProducts to prevent automatic fetching

  const addProduct = () => {
    append({ name: '', description: '', qty: 1, rate: 0 });
  };

  const removeProduct = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const user = useAppSelector((state) => state.auth.user);

  const onSubmit = async (values: z.infer<typeof productsFormSchema>) => {
    try {
      if (!user?.id) {
        error('Authentication Error', 'User not authenticated. Please log in again.');
        return;
      }

      // Clear existing products before adding new ones
      dispatch(clearProducts());

      // Save products to API and update Redux store
      const savedProducts = [];
      for (const product of values.products) {
        const savedProduct = await createProductMutation.mutateAsync({
          name: product.name,
          description: product.description || '',
          qty: Number(product.qty),
          rate: Number(product.rate)
        });
        
        // Dispatch to Redux store
        const productPayload = {
          _id: savedProduct.product.id,
          name: savedProduct.product.name,
          description: product.description || '',
          quantity: Number(savedProduct.product.qty),
          rate: Number(savedProduct.product.rate),
          total: Number(savedProduct.product.qty) * Number(savedProduct.product.rate),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        dispatch(addProductSuccess(productPayload));
        savedProducts.push(savedProduct);
      }
      
      // Show success toast and navigate
      success(
        'Products Saved Successfully', 
        `${savedProducts.length} product(s) saved. Redirecting to PDF generation...`
      );
      
      // Navigate after a brief delay to show success message
      setTimeout(() => {
        navigate('/generate-pdf');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save products. Please try again.';
      error('Save Failed', errorMessage);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--figma-white)' }}>
      <div className="form-container section-spacing">
        <div className="mb-8">
          <h1 className="heading-primary mb-2">Add Products</h1>
          <p className="text-gray-600">Add products to generate your invoice</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="form-card mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Product Details
                </CardTitle>
                <CardDescription>
                  Enter product information to calculate totals automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Product {index + 1}
                      </h3>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                
                    <div className="product-row gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label">
                                Product Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter product name"
                                  className="form-input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-sm text-red-600" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`products.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label">
                                Description (Optional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter product description"
                                  className="form-input"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-sm text-red-600" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormField
                          control={form.control}
                          name={`products.${index}.qty`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label">
                                Quantity
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  min="1"
                                  className="form-input"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage className="text-sm text-red-600" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormField
                          control={form.control}
                          name={`products.${index}.rate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="form-label">
                                Rate (₹)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className="form-input"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage className="text-sm text-red-600" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Product Total:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{((form.watch(`products.${index}.qty`) || 0) * (form.watch(`products.${index}.rate`) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={addProduct}
              className="btn-secondary mobile-stack md-flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>

            <div className="mt-6">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || createProductMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {form.formState.isSubmitting || createProductMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Products...
                  </>
                ) : (
                  'Save Products & Continue'
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Subtotal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">Subtotal:</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{calculateSubtotal().toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;