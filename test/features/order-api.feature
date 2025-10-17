Feature: Order API Testing
  As a client application
  I want to manage orders through the Order API
  So that I can perform CRUD operations on order data

  Background:
    Given the Order API is available at the base URL
    And there are existing users and products in the system

  Scenario: Create a new order
    Given a user exists with ID "user1"
    And a product exists with ID "product1" with price 29.99
    When I send a POST request to "/orders" with order data:
      | userId | products                                          |
      | user1  | [{"productId":"product1","quantity":2,"price":29.99}] |
    Then the response status should be 200
    And the response should contain order data with generated ID
    And the order should have userId "user1"
    And the order should have totalAmount 59.98
    And the order should have status "PENDING"

  Scenario: Retrieve all orders
    Given there are existing orders in the system
    When I send a GET request to "/orders"
    Then the response status should be 200
    And the response should contain a list of orders
    And each order should have required fields: id, userId, products, totalAmount, status, createdAt, updatedAt

  Scenario: Retrieve a specific order by ID
    Given an order exists with ID "order1"
    When I send a GET request to "/orders/order1"
    Then the response status should be 200
    And the response should contain order data for ID "order1"

  Scenario: Retrieve a non-existent order
    When I send a GET request to "/orders/nonexistent123"
    Then the response status should be 404
    And the response should contain error message "Order not found"

  Scenario: Update order status
    Given an order exists with ID "order1"
    When I send a PUT request to "/orders/order1" with updated data:
      | status     |
      | PROCESSING |
    Then the response status should be 200
    And the response should contain updated order data
    And the order status should be "PROCESSING"

  Scenario: Update order products and recalculate total
    Given an order exists with ID "order1"
    And a product exists with ID "product1" with price 29.99
    When I send a PUT request to "/orders/order1" with updated products:
      | products                                          |
      | [{"productId":"product1","quantity":3,"price":29.99}] |
    Then the response status should be 200
    And the order totalAmount should be 89.97

  Scenario: Update a non-existent order
    When I send a PUT request to "/orders/nonexistent123" with data:
      | status   |
      | SHIPPED  |
    Then the response status should be 404
    And the response should contain error message "Order not found"

  Scenario: Delete an existing order
    Given an order exists with ID "order1"
    When I send a DELETE request to "/orders/order1"
    Then the response status should be 200
    And the response should contain success message

  Scenario: Delete a non-existent order
    When I send a DELETE request to "/orders/nonexistent123"
    Then the response status should be 404
    And the response should contain error message "Order not found"

  Scenario: Create order with invalid user
    When I send a POST request to "/orders" with order data:
      | userId        | products                                          |
      | nonexistent   | [{"productId":"product1","quantity":1,"price":29.99}] |
    Then the response status should be 404
    And the response should contain error message "User not found"

  Scenario: Create order with invalid product
    Given a user exists with ID "user1"
    When I send a POST request to "/orders" with order data:
      | userId | products                                              |
      | user1  | [{"productId":"nonexistent","quantity":1,"price":29.99}] |
    Then the response status should be 404
    And the response should contain error message "Product nonexistent not found"

  Scenario: Create order with insufficient stock
    Given a user exists with ID "user1"
    And a product exists with ID "product1" with stock 5
    When I send a POST request to "/orders" with order data:
      | userId | products                                          |
      | user1  | [{"productId":"product1","quantity":10,"price":29.99}] |
    Then the response status should be 400
    And the response should contain error message "Insufficient stock for product product1"

  Scenario: Create order with missing data
    When I send a POST request to "/orders" with invalid data:
      | userId | products |
      |        | []       |
    Then the response status should be 400
    And the response should contain error message "User ID and products are required"

  Scenario: Create order with no request body
    When I send a POST request to "/orders" with no body
    Then the response status should be 400
    And the response should contain error message "Request body is required"

  Scenario: Verify order status transitions
    Given an order exists with status "PENDING"
    When I update the order status to "PROCESSING"
    Then the order status should be "PROCESSING"
    When I update the order status to "SHIPPED"
    Then the order status should be "SHIPPED"
    When I update the order status to "DELIVERED"
    Then the order status should be "DELIVERED"