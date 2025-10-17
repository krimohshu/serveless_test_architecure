import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import { expect } from 'chai';

interface TestContext {
  baseUrl: string;
  response: AxiosResponse | null;
  createdUsers: string[];
  createdProducts: string[];
  createdOrders: string[];
}

// Global test context
let context: TestContext = {
  baseUrl: '',
  response: null,
  createdUsers: [],
  createdProducts: [],
  createdOrders: []
};

Before(function() {
  // Reset context before each scenario
  context.response = null;
});

After(async function() {
  // Cleanup created resources after each scenario
  try {
    // Clean up created orders first (they depend on users/products)
    for (const orderId of context.createdOrders) {
      try {
        await axios.delete(`${context.baseUrl}/orders/${orderId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    // Clean up created products
    for (const productId of context.createdProducts) {
      try {
        await axios.delete(`${context.baseUrl}/products/${productId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    // Clean up created users
    for (const userId of context.createdUsers) {
      try {
        await axios.delete(`${context.baseUrl}/users/${userId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    
    // Reset arrays
    context.createdUsers = [];
    context.createdProducts = [];
    context.createdOrders = [];
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
});

// Background steps
Given('the {word} API is available at the base URL', function(apiType: string) {
  context.baseUrl = process.env.API_BASE_URL || 'https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev';
  expect(context.baseUrl).to.not.be.empty;
});

Given('there are existing users in the system', async function() {
  // Verify that the sample user exists
  const response = await axios.get(`${context.baseUrl}/users`);
  expect(response.status).to.equal(200);
  expect(response.data.data).to.be.an('array');
  expect(response.data.data.length).to.be.greaterThan(0);
});

Given('there are existing products in the system', async function() {
  // Verify that the sample product exists
  const response = await axios.get(`${context.baseUrl}/products`);
  expect(response.status).to.equal(200);
  expect(response.data.data).to.be.an('array');
  expect(response.data.data.length).to.be.greaterThan(0);
});

Given('there are existing orders in the system', async function() {
  // Create a test order if none exist
  const ordersResponse = await axios.get(`${context.baseUrl}/orders`);
  if (ordersResponse.data.data.length === 0) {
    // Create test user and product first
    const userResponse = await axios.post(`${context.baseUrl}/users`, {
      name: 'Test User',
      email: 'test@example.com'
    });
    const userId = userResponse.data.data.id;
    context.createdUsers.push(userId);
    
    const productResponse = await axios.post(`${context.baseUrl}/products`, {
      name: 'Test Product',
      description: 'Test Description',
      price: 10.00,
      category: 'Test',
      stock: 100
    });
    const productId = productResponse.data.data.id;
    context.createdProducts.push(productId);
    
    // Create test order
    const orderResponse = await axios.post(`${context.baseUrl}/orders`, {
      userId: userId,
      products: [{ productId: productId, quantity: 1, price: 10.00 }]
    });
    context.createdOrders.push(orderResponse.data.data.id);
  }
});

Given('there are existing users and products in the system', async function() {
  // Ensure both users and products exist
  await this.step('there are existing users in the system');
  await this.step('there are existing products in the system');
});

// Entity existence steps
Given('a user exists with ID {string}', async function(userId: string) {
  try {
    const response = await axios.get(`${context.baseUrl}/users/${userId}`);
    expect(response.status).to.equal(200);
  } catch (error) {
    // If user doesn't exist, the sample data should have it
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`User with ID ${userId} should exist in sample data`);
    }
    throw error;
  }
});

Given('a product exists with ID {string}', async function(productId: string) {
  try {
    const response = await axios.get(`${context.baseUrl}/products/${productId}`);
    expect(response.status).to.equal(200);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`Product with ID ${productId} should exist in sample data`);
    }
    throw error;
  }
});

Given('a product exists with ID {string} with price {float}', async function(productId: string, price: number) {
  const response = await axios.get(`${context.baseUrl}/products/${productId}`);
  expect(response.status).to.equal(200);
  expect(response.data.data.price).to.equal(price);
});

Given('a product exists with ID {string} with stock {int}', async function(productId: string, stock: number) {
  // Create or update product with specific stock
  try {
    const response = await axios.get(`${context.baseUrl}/products/${productId}`);
    // Update existing product
    await axios.put(`${context.baseUrl}/products/${productId}`, { stock: stock });
  } catch (error) {
    // Create new product
    const productResponse = await axios.post(`${context.baseUrl}/products`, {
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      category: 'Test',
      stock: stock
    });
    context.createdProducts.push(productResponse.data.data.id);
  }
});

Given('an order exists with ID {string}', async function(orderId: string) {
  try {
    const response = await axios.get(`${context.baseUrl}/orders/${orderId}`);
    expect(response.status).to.equal(200);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`Order with ID ${orderId} should exist`);
    }
    throw error;
  }
});

// HTTP request steps
When('I send a GET request to {string}', async function(endpoint: string) {
  try {
    context.response = await axios.get(`${context.baseUrl}${endpoint}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with no body', async function(endpoint: string) {
  try {
    context.response = await axios.post(`${context.baseUrl}${endpoint}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

// Response validation steps
Then('the response status should be {int}', function(expectedStatus: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.status).to.equal(expectedStatus);
});

Then('the response should contain error message {string}', function(expectedMessage: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('error');
  expect(context.response!.data.error).to.include(expectedMessage);
});

Then('the response should contain success message', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
});

export { context };