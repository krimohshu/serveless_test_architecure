import { When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { expect } from 'chai';
import { context } from './common-steps';

// Order-specific request steps
When('I send a POST request to {string} with order data:', async function(endpoint: string, dataTable: any) {
  const orderData = dataTable.hashes()[0];
  
  // Parse the products field if it's a JSON string
  if (orderData.products && typeof orderData.products === 'string') {
    try {
      orderData.products = JSON.parse(orderData.products);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }
  
  try {
    context.response = await axios.post(`${context.baseUrl}${endpoint}`, orderData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Track created order for cleanup
    if (context.response?.data?.success && context.response.data.data?.id) {
      context.createdOrders.push(context.response.data.data.id);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with order containing:', async function(endpoint: string, dataTable: any) {
  const rows = dataTable.hashes();
  
  // Build order from table data
  const orderData = {
    userId: rows[0].userId,
    products: rows.map((row: any) => ({
      productId: row.productId,
      quantity: parseInt(row.quantity),
      price: parseFloat(row.price)
    }))
  };
  
  try {
    context.response = await axios.post(`${context.baseUrl}${endpoint}`, orderData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Track created order for cleanup
    if (context.response?.data?.success && context.response.data.data?.id) {
      context.createdOrders.push(context.response.data.data.id);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

When('I send a PUT request to {string} with order data:', async function(endpoint: string, dataTable: any) {
  const updateData = dataTable.hashes()[0];
  
  try {
    context.response = await axios.put(`${context.baseUrl}${endpoint}`, updateData, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

When('I send a POST request to {string} with invalid order data:', async function(endpoint: string, dataTable: any) {
  const invalidData = dataTable.hashes()[0];
  
  // Parse the products field if it's a JSON string
  if (invalidData.products && typeof invalidData.products === 'string') {
    try {
      invalidData.products = JSON.parse(invalidData.products);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }
  
  try {
    context.response = await axios.post(`${context.baseUrl}${endpoint}`, invalidData, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

// Order-specific response validation steps
Then('the response should contain order data with generated ID', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id');
  expect(context.response!.data.data.id).to.be.a('string');
  expect(context.response!.data.data.id).to.not.be.empty;
});

Then('the response should contain a list of orders', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.be.an('array');
});

Then('each order should have required fields: id, userId, products, total, status, createdAt, updatedAt', function() {
  expect(context.response).to.not.be.null;
  const orders = context.response!.data.data;
  expect(orders).to.be.an('array');
  
  orders.forEach((order: any) => {
    expect(order).to.have.property('id');
    expect(order).to.have.property('userId');
    expect(order).to.have.property('products');
    expect(order).to.have.property('total');
    expect(order).to.have.property('status');
    expect(order).to.have.property('createdAt');
    expect(order).to.have.property('updatedAt');
  });
});

Then('the response should contain order data for ID {string}', function(orderId: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id', orderId);
});

Then('the response should contain updated order data', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id');
  expect(context.response!.data.data).to.have.property('updatedAt');
});

Then('the order should have userId {string}', function(expectedUserId: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('userId', expectedUserId);
});

Then('the order should have status {string}', function(expectedStatus: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('status', expectedStatus);
});

Then('the order should have {int} product(s)', function(expectedCount: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('products');
  expect(context.response!.data.data.products).to.be.an('array');
  expect(context.response!.data.data.products).to.have.lengthOf(expectedCount);
});

Then('the order total should be {float}', function(expectedTotal: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('total');
  expect(context.response!.data.data.total).to.be.closeTo(expectedTotal, 0.01);
});

Then('the order status should be {string}', function(expectedStatus: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('status', expectedStatus);
});

Then('the order should contain product {string} with quantity {int}', function(productId: string, quantity: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('products');
  
  const products = context.response!.data.data.products;
  const product = products.find((p: any) => p.productId === productId);
  
  expect(product, `Product ${productId} not found in order`).to.exist;
  expect(product.quantity).to.equal(quantity);
});

Then('the response should indicate the user does not exist', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.status).to.equal(400);
  expect(context.response!.data).to.have.property('success', false);
  expect(context.response!.data.message).to.match(/user.*not found/i);
});

Then('the response should indicate the product does not exist', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.status).to.equal(400);
  expect(context.response!.data).to.have.property('success', false);
  expect(context.response!.data.message).to.match(/product.*not found/i);
});

Then('the response should indicate insufficient stock', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.status).to.equal(400);
  expect(context.response!.data).to.have.property('success', false);
  expect(context.response!.data.message).to.match(/insufficient stock|not enough stock/i);
});

Then('the response should indicate invalid status transition', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.status).to.equal(400);
  expect(context.response!.data).to.have.property('success', false);
  expect(context.response!.data.message).to.match(/invalid.*status/i);
});
