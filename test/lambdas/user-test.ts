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
    console.log('🧪 Starting User API Tests');
    
    // Get base URL from event or use default
    const baseUrl = event.body ? JSON.parse(event.body).baseUrl : 
                   'https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev';
    
    const startTime = Date.now();
    const testResults: TestResult[] = [];
    
    // Test 1: Create a new user
    await runTest(testResults, 'Create a new user', async () => {
      const response = await axios.post(`${baseUrl}/users`, {
        name: 'Test User API',
        email: 'testuser@api.com'
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (!response.data.data.id) throw new Error('User ID should be generated');
      if (response.data.data.name !== 'Test User API') throw new Error('User name mismatch');
      if (response.data.data.email !== 'testuser@api.com') throw new Error('User email mismatch');
      
      // Store user ID for cleanup
      return response.data.data.id;
    });
    
    // Test 2: Retrieve all users
    await runTest(testResults, 'Retrieve all users', async () => {
      const response = await axios.get(`${baseUrl}/users`);
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (!Array.isArray(response.data.data)) throw new Error('Response should contain array of users');
      if (response.data.data.length === 0) throw new Error('Should have at least one user');
      
      // Verify user structure
      const user = response.data.data[0];
      if (!user.id || !user.name || !user.email || !user.createdAt || !user.updatedAt) {
        throw new Error('User missing required fields');
      }
    });
    
    // Test 3: Retrieve specific user (using sample user)
    await runTest(testResults, 'Retrieve specific user', async () => {
      const response = await axios.get(`${baseUrl}/users/user1`);
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.id !== 'user1') throw new Error('User ID mismatch');
    });
    
    // Test 4: Retrieve non-existent user
    await runTest(testResults, 'Retrieve non-existent user', async () => {
      try {
        const response = await axios.get(`${baseUrl}/users/nonexistent123`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          if (!error.response.data.error?.includes('User not found')) {
            throw new Error('Error message should mention user not found');
          }
          // This is expected behavior
          return;
        }
        throw error;
      }
    });
    
    // Test 5: Update existing user
    await runTest(testResults, 'Update existing user', async () => {
      const response = await axios.put(`${baseUrl}/users/user1`, {
        name: 'Updated Test User'
      });
      
      if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
      if (!response.data.success) throw new Error('Response success should be true');
      if (response.data.data.name !== 'Updated Test User') throw new Error('User name not updated');
    });
    
    // Test 6: Update non-existent user
    await runTest(testResults, 'Update non-existent user', async () => {
      try {
        const response = await axios.put(`${baseUrl}/users/nonexistent123`, {
          name: 'Should Fail'
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // This is expected behavior
          return;
        }
        throw error;
      }
    });
    
    // Test 7: Delete non-existent user
    await runTest(testResults, 'Delete non-existent user', async () => {
      try {
        const response = await axios.delete(`${baseUrl}/users/nonexistent123`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // This is expected behavior
          return;
        }
        throw error;
      }
    });
    
    // Test 8: Create user with invalid data
    await runTest(testResults, 'Create user with invalid data', async () => {
      try {
        const response = await axios.post(`${baseUrl}/users`, {
          name: '',
          email: ''
        });
        throw new Error('Should have returned 400');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          // This is expected behavior
          return;
        }
        throw error;
      }
    });
    
    const totalDuration = Date.now() - startTime;
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    
    console.log(`📊 User API Test Results:`);
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
      service: 'user',
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
    console.error('❌ User API Test Lambda failed:', error);
    return createErrorResponse(500, 'User API test execution failed', error);
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