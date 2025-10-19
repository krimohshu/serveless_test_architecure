import { When, Then } from '@cucumber/cucumber';
import axios from 'axios';
import { expect } from 'chai';
import { context } from './common-steps';

// User-specific request steps
When('I send a POST request to {string} with user data:', async function(endpoint: string, dataTable: any) {
  const userData = dataTable.hashes()[0];
  try {
    context.response = await axios.post(`${context.baseUrl}${endpoint}`, userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Track created user for cleanup
    if (context.response?.data?.success && context.response.data.data?.id) {
      context.createdUsers.push(context.response.data.data.id);
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

When('I send a PUT request to {string} with updated data:', async function(endpoint: string, dataTable: any) {
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

When('I send a PUT request to {string} with data:', async function(endpoint: string, dataTable: any) {
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

When('I send a POST request to {string} with invalid data:', async function(endpoint: string, dataTable: any) {
  const invalidData = dataTable.hashes()[0];
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

When('I send a DELETE request to {string}', async function(endpoint: string) {
  try {
    context.response = await axios.delete(`${context.baseUrl}${endpoint}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      context.response = error.response;
    } else {
      throw error;
    }
  }
});

// User-specific response validation steps
Then('the response should contain user data with generated ID', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id');
  expect(context.response!.data.data.id).to.be.a('string');
  expect(context.response!.data.data.id).to.not.be.empty;
});

Then('the response should contain a list of users', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.be.an('array');
});

Then('each user should have required fields: id, name, email, createdAt, updatedAt', function() {
  expect(context.response).to.not.be.null;
  const users = context.response!.data.data;
  expect(users).to.be.an('array');
  
  users.forEach((user: any) => {
    expect(user).to.have.property('id');
    expect(user).to.have.property('name');
    expect(user).to.have.property('email');
    expect(user).to.have.property('createdAt');
    expect(user).to.have.property('updatedAt');
  });
});

Then('the response should contain user data for ID {string}', function(userId: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id', userId);
});

Then('the response should contain updated user data', function() {
  expect(context.response).to.not.be.null;
  expect(context.response!.data).to.have.property('success', true);
  expect(context.response!.data.data).to.have.property('id');
  expect(context.response!.data.data).to.have.property('updatedAt');
});

Then('the user should have name {string}', function(expectedName: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('name', expectedName);
});

Then('the user should have email {string}', function(expectedEmail: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('email', expectedEmail);
});

Then('the user name should be {string}', function(expectedName: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('name', expectedName);
});

Then('the user email should be {string}', function(expectedEmail: string) {
  expect(context.response).to.not.be.null;
  expect(context.response!.data.data).to.have.property('email', expectedEmail);
});