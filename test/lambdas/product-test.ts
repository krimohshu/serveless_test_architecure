import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createSuccessResponse, createErrorResponse } from '../../src/utils/response';
import axios from 'axios';

interface TestResult {
  name: string;
  status: 'passed' | 'failed';
  error?: string;
  duration: number;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('🧪 Starting Product API Tests');
    
    const baseUrl = event.body ? JSON.parse(event.body).baseUrl : 
                   'https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev';
    
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    let createdProductId: string | null = null;
    
    // Test 1: Create a new product
    await runTest(testResults, 'Create a new product', async () => {
      const response = await axios.post(`${baseUrl}/products`, {
        name: 'Test Product API',
        description: 'A test product for API testing',
        price: 199.99,
        category: 'Test Category',
        stock: 25
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (!response.data.data.id) throw new Error('Product ID should be generated');
      if (response.data.data.name !== 'Test Product API') throw new Error('Product name mismatch');
      if (response.data.data.price !== 199.99) throw new Error('Product price mismatch');
      if (response.data.data.stock !== 25) throw new Error('Product stock mismatch');
      
      createdProductId = response.data.data.id;
      return createdProductId;
    });
    
    // Test 2: Retrieve all products
    await runTest(testResults, 'Retrieve all products', async () => {
      const response = await axios.get(`${baseUrl}/products`);
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (!Array.isArray(response.data.data)) throw new Error('Response should contain array of products');
      if (response.data.data.length === 0) throw new Error('Should have at least one product');
      
      // Verify product structure
      const product = response.data.data[0];
      const requiredFields = ['id', 'name', 'description', 'price', 'category', 'stock', 'createdAt', 'updatedAt'];
      for (const field of requiredFields) {
        if (!(field in product)) {
          throw new Error(`Product missing required field: ${field}`);
        }
      }
    });
    
    // Test 3: Retrieve specific product (using sample product)
    await runTest(testResults, 'Retrieve specific product', async () => {
      const response = await axios.get(`${baseUrl}/products/product1`);
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.id !== 'product1') throw new Error('Product ID mismatch');
    });
    
    // Test 4: Retrieve non-existent product
    await runTest(testResults, 'Retrieve non-existent product', async () => {
      try {
        await axios.get(`${baseUrl}/products/nonexistent123`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          if (!error.response.data.error?.includes('Product not found')) {
            throw new Error('Error message should mention product not found');
          }
          return;
        }
        throw error;
      }
    });
    
    // Test 5: Update existing product
    await runTest(testResults, 'Update existing product', async () => {
      const targetId = createdProductId || 'product1';
      const response = await axios.put(`${baseUrl}/products/${targetId}`, {
        name: 'Updated Test Product',
        price: 249.99
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.name !== 'Updated Test Product') throw new Error('Product name not updated');
      if (response.data.data.price !== 249.99) throw new Error('Product price not updated');
    });
    
    // Test 6: Update product price only
    await runTest(testResults, 'Update product price only', async () => {
      const targetId = createdProductId || 'product1';
      const response = await axios.put(`${baseUrl}/products/${targetId}`, {
        price: 179.99
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.price !== 179.99) throw new Error('Product price not updated');
    });
    
    // Test 7: Update non-existent product
    await runTest(testResults, 'Update non-existent product', async () => {
      try {
        await axios.put(`${baseUrl}/products/nonexistent123`, {
          name: 'Should Fail'
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
        }
        throw error;
      }
    });
    
    // Test 8: Create product with invalid data
    await runTest(testResults, 'Create product with invalid data', async () => {
      try {
        await axios.post(`${baseUrl}/products`, {
          name: '',
          description: '',
          price: undefined,
          category: '',
          stock: undefined
        });
        throw new Error('Should have returned 400');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          return;
        }
        throw error;
      }
    });
    
    // Test 9: Verify stock management
    await runTest(testResults, 'Verify stock management', async () => {
      const targetId = createdProductId || 'product1';
      
      // Update stock to 0
      const updateResponse = await axios.put(`${baseUrl}/products/${targetId}`, {
        stock: 0
      });
      
      if (updateResponse.status !== 200) throw new Error('Failed to update stock');
      if (updateResponse.data.data.stock !== 0) throw new Error('Stock not updated to 0');
      
      // Verify product is still retrievable
      const getResponse = await axios.get(`${baseUrl}/products/${targetId}`);
      if (getResponse.status !== 200) throw new Error('Product should still be retrievable');
      if (getResponse.data.data.stock !== 0) throw new Error('Stock should be 0');
    });
    
    // Test 10: Delete created product (cleanup)
    if (createdProductId) {
      await runTest(testResults, 'Delete created product', async () => {
        const response = await axios.delete(`${baseUrl}/products/${createdProductId}`);
        
        if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
        if (!response.data.success) throw new Error('Response success should be true');
      });
    }
    
    // Test 11: Delete non-existent product
    await runTest(testResults, 'Delete non-existent product', async () => {
      try {
        await axios.delete(`${baseUrl}/products/nonexistent123`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
        }
        throw error;
      }
    });
    
    const totalDuration = Date.now() - startTime;
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    
    console.log(`📊 Product API Test Results:`);
    console.log(`   Scenarios: ${testResults.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Duration: ${totalDuration}ms`);
    
    testResults.forEach(test => {
      const emoji = test.status === 'passed' ? '✅' : '❌';
      console.log(`   ${emoji} ${test.name} (${test.duration}ms)`);
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    });
    
    return createSuccessResponse({
      service: 'product',
      scenarios: testResults.length,
      passed,
      failed,
      status: failed === 0 ? 'success' : 'failed',
      duration: totalDuration,
      report: {
        tests: testResults,
        summary: {
          total: testResults.length,
          passed,
          failed,
          duration: totalDuration
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Product API Test Lambda failed:', error);
    return createErrorResponse(500, 'Product API test execution failed', error);
  }
};

async function runTest(results: TestResult[], testName: string, testFn: () => Promise<any>): Promise<void> {
  const startTime = Date.now();
  try {
    await testFn();
    results.push({
      name: testName,
      status: 'passed',
      duration: Date.now() - startTime
    });
  } catch (error) {
    results.push({
      name: testName,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });
  }
}