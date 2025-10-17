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
    console.log('🧪 Starting Order API Tests');
    
    const baseUrl = event.body ? JSON.parse(event.body).baseUrl : 
                   'https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev';
    
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    let createdOrderId: string | null = null;
    let testUserId: string | null = null;
    let testProductId: string | null = null;
    
    // Setup: Create test user and product
    await runTest(testResults, 'Setup: Create test user', async () => {
      const response = await axios.post(`${baseUrl}/users`, {
        name: 'Order Test User',
        email: 'ordertest@example.com'
      });
      
      if (response.status !== 200) throw new Error('Failed to create test user');
      testUserId = response.data.data.id;
    });
    
    await runTest(testResults, 'Setup: Create test product', async () => {
      const response = await axios.post(`${baseUrl}/products`, {
        name: 'Order Test Product',
        description: 'Product for order testing',
        price: 29.99,
        category: 'Test',
        stock: 100
      });
      
      if (response.status !== 200) throw new Error('Failed to create test product');
      testProductId = response.data.data.id;
    });
    
    // Test 1: Create a new order
    await runTest(testResults, 'Create a new order', async () => {
      if (!testUserId || !testProductId) throw new Error('Test setup failed');
      
      const response = await axios.post(`${baseUrl}/orders`, {
        userId: testUserId,
        products: [
          {
            productId: testProductId,
            quantity: 2,
            price: 29.99
          }
        ]
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (!response.data.data.id) throw new Error('Order ID should be generated');
      if (response.data.data.userId !== testUserId) throw new Error('Order userId mismatch');
      if (response.data.data.totalAmount !== 59.98) throw new Error('Order totalAmount should be 59.98');
      if (response.data.data.status !== 'PENDING') throw new Error('Order status should be PENDING');
      
      createdOrderId = response.data.data.id;
    });
    
    // Test 2: Retrieve all orders
    await runTest(testResults, 'Retrieve all orders', async () => {
      const response = await axios.get(`${baseUrl}/orders`);
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (!Array.isArray(response.data.data)) throw new Error('Response should contain array of orders');
      
      if (response.data.data.length > 0) {
        const order = response.data.data[0];
        const requiredFields = ['id', 'userId', 'products', 'totalAmount', 'status', 'createdAt', 'updatedAt'];
        for (const field of requiredFields) {
          if (!(field in order)) {
            throw new Error(`Order missing required field: ${field}`);
          }
        }
      }
    });
    
    // Test 3: Retrieve specific order
    await runTest(testResults, 'Retrieve specific order', async () => {
      if (!createdOrderId) throw new Error('No order created');
      
      const response = await axios.get(`${baseUrl}/orders/${createdOrderId}`);
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.id !== createdOrderId) throw new Error('Order ID mismatch');
    });
    
    // Test 4: Retrieve non-existent order
    await runTest(testResults, 'Retrieve non-existent order', async () => {
      try {
        await axios.get(`${baseUrl}/orders/nonexistent123`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          if (!error.response.data.error?.includes('Order not found')) {
            throw new Error('Error message should mention order not found');
          }
          return;
        }
        throw error;
      }
    });
    
    // Test 5: Update order status
    await runTest(testResults, 'Update order status', async () => {
      if (!createdOrderId) throw new Error('No order created');
      
      const response = await axios.put(`${baseUrl}/orders/${createdOrderId}`, {
        status: 'PROCESSING'
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.status !== 'PROCESSING') throw new Error('Order status not updated');
    });
    
    // Test 6: Update order products and recalculate total
    await runTest(testResults, 'Update order products', async () => {
      if (!createdOrderId || !testProductId) throw new Error('Test data missing');
      
      const response = await axios.put(`${baseUrl}/orders/${createdOrderId}`, {
        products: [
          {
            productId: testProductId,
            quantity: 3,
            price: 29.99
          }
        ]
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.totalAmount !== 89.97) throw new Error('Order totalAmount should be 89.97');
    });
    
    // Test 7: Update non-existent order
    await runTest(testResults, 'Update non-existent order', async () => {
      try {
        await axios.put(`${baseUrl}/orders/nonexistent123`, {
          status: 'SHIPPED'
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
        }
        throw error;
      }
    });
    
    // Test 8: Create order with invalid user
    await runTest(testResults, 'Create order with invalid user', async () => {
      if (!testProductId) throw new Error('Test product not created');
      
      try {
        await axios.post(`${baseUrl}/orders`, {
          userId: 'nonexistentuser',
          products: [
            {
              productId: testProductId,
              quantity: 1,
              price: 29.99
            }
          ]
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          if (!error.response.data.error?.includes('User not found')) {
            throw new Error('Error message should mention user not found');
          }
          return;
        }
        throw error;
      }
    });
    
    // Test 9: Create order with invalid product
    await runTest(testResults, 'Create order with invalid product', async () => {
      if (!testUserId) throw new Error('Test user not created');
      
      try {
        await axios.post(`${baseUrl}/orders`, {
          userId: testUserId,
          products: [
            {
              productId: 'nonexistentproduct',
              quantity: 1,
              price: 29.99
            }
          ]
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return;
        }
        throw error;
      }
    });
    
    // Test 10: Create order with insufficient stock
    await runTest(testResults, 'Create order with insufficient stock', async () => {
      if (!testUserId || !testProductId) throw new Error('Test data missing');
      
      // First update product stock to a low value
      await axios.put(`${baseUrl}/products/${testProductId}`, {
        stock: 5
      });
      
      try {
        await axios.post(`${baseUrl}/orders`, {
          userId: testUserId,
          products: [
            {
              productId: testProductId,
              quantity: 10,
              price: 29.99
            }
          ]
        });
        throw new Error('Should have returned 400');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          if (!error.response.data.error?.includes('Insufficient stock')) {
            throw new Error('Error message should mention insufficient stock');
          }
          return;
        }
        throw error;
      }
    });
    
    // Test 11: Create order with missing data
    await runTest(testResults, 'Create order with missing data', async () => {
      try {
        await axios.post(`${baseUrl}/orders`, {
          userId: '',
          products: []
        });
        throw new Error('Should have returned 400');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          return;
        }
        throw error;
      }
    });
    
    // Test 12: Verify order status transitions
    await runTest(testResults, 'Verify order status transitions', async () => {
      if (!createdOrderId) throw new Error('No order created');
      
      const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
      
      for (const status of statuses) {
        const response = await axios.put(`${baseUrl}/orders/${createdOrderId}`, {
          status: status
        });
        
        if (response.status !== 200) throw new Error(`Failed to update status to ${status}`);
        if (response.data.data.status !== status) throw new Error(`Status should be ${status}`);
      }
    });
    
    // Cleanup: Delete created resources
    if (createdOrderId) {
      await runTest(testResults, 'Cleanup: Delete created order', async () => {
        const response = await axios.delete(`${baseUrl}/orders/${createdOrderId}`);
        if (response.status !== 200) throw new Error('Failed to delete order');
      });
    }
    
    if (testProductId) {
      await runTest(testResults, 'Cleanup: Delete test product', async () => {
        const response = await axios.delete(`${baseUrl}/products/${testProductId}`);
        if (response.status !== 200) throw new Error('Failed to delete product');
      });
    }
    
    if (testUserId) {
      await runTest(testResults, 'Cleanup: Delete test user', async () => {
        const response = await axios.delete(`${baseUrl}/users/${testUserId}`);
        if (response.status !== 200) throw new Error('Failed to delete user');
      });
    }
    
    // Test 13: Delete non-existent order
    await runTest(testResults, 'Delete non-existent order', async () => {
      try {
        await axios.delete(`${baseUrl}/orders/nonexistent123`);
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
    
    console.log(`📊 Order API Test Results:`);
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
      service: 'order',
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
    console.error('❌ Order API Test Lambda failed:', error);
    return createErrorResponse(500, 'Order API test execution failed', error);
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