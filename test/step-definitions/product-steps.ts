import { When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { expect } from 'chai';
import { context } from './common-steps';

// Product-specific request steps
When('I send a POST request to {string} with product data:', async function(endpoint: string, dataTable: any) {
  const productData = dataTable.hashes()[0];
  
  // Convert numeric fields from strings
  if (productData.price) productData.price = parseFloat(productData.price);
  if (productData.stock) productData.stock = parseInt(productData.stock);
  
  try {
    context.response = await axios.post(`${context.baseUrl}${endpoint}`, productData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Track created product for cleanup
    if (context.response?.data?.success && context.response.data.data?.id) {
      context.createdProducts.push(context.response.data.data.id);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

When('I send a PUT request to {string} with product data:', async function(endpoint: string, dataTable: any) {
  const updateData = dataTable.hashes()[0];
  
  // Convert numeric fields from strings
  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.stock) updateData.stock = parseInt(updateData.stock);
  
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

When('I send a PATCH request to {string} with data:', async function(endpoint: string, dataTable: any) {
  const patchData = dataTable.hashes()[0];
  
  // Convert numeric fields from strings
  if (patchData.price) patchData.price = parseFloat(patchData.price);
  if (patchData.stock) patchData.stock = parseInt(patchData.stock);
  
  try {
    context.response = await axios.patch(`${context.baseUrl}${endpoint}`, patchData, {
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

When('I send a POST request to {string} with invalid product data:', async function(endpoint: string, dataTable: any) {
  const invalidData = dataTable.hashes()[0];
  
  // Convert numeric fields from strings if present
  if (invalidData.price) invalidData.price = parseFloat(invalidData.price);
  if (invalidData.stock) invalidData.stock = parseInt(invalidData.stock);
  
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

// Product-specific response validation steps
Then('the response should contain product data with generated ID', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id');
  expect(context.response!.data.data.id).to.be.a('string');
  expect(context.response!.data.data.id).to.not.be.empty;
});

Then('the response should contain a list of products', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.be.an('array');
});

Then('each product should have required fields: id, name, description, price, category, stock, createdAt, updatedAt', function() {
  expect(context.response).to.not.be.null;
  const products = context.response!.data.data;
  expect(products).to.be.an('array');
  
  products.forEach((product: any) => {
    expect(product).to.have.property('id');
    expect(product).to.have.property('name');
    expect(product).to.have.property('description');
    expect(product).to.have.property('price');
    expect(product).to.have.property('category');
    expect(product).to.have.property('stock');
    expect(product).to.have.property('createdAt');
    expect(product).to.have.property('updatedAt');
  });
});

Then('the response should contain product data for ID {string}', function(productId: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id', productId);
});

Then('the response should contain updated product data', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id');
  expect(context.response!.data.data).to.have.property('updatedAt');
});

Then('the product should have name {string}', function(expectedName: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('name', expectedName);
});

Then('the product should have description {string}', function(expectedDescription: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('description', expectedDescription);
});

Then('the product should have price {float}', function(expectedPrice: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('price');
  expect(context.response!.data.data.price).to.be.closeTo(expectedPrice, 0.01);
});

Then('the product should have category {string}', function(expectedCategory: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('category', expectedCategory);
});

Then('the product should have stock {int}', function(expectedStock: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('stock', expectedStock);
});

Then('the product name should be {string}', function(expectedName: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('name', expectedName);
});

Then('the product stock should be {int}', function(expectedStock: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('stock', expectedStock);
});

Then('the product price should be {float}', function(expectedPrice: number) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('price');
  expect(context.response!.data.data.price).to.be.closeTo(expectedPrice, 0.01);
});
