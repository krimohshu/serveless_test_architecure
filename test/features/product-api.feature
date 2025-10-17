Feature: Product API Testing
  As a client application
  I want to manage products through the Product API
  So that I can perform CRUD operations on product data

  Background:
    Given the Product API is available at the base URL

  Scenario: Create a new product
    When I send a POST request to "/products" with product data:
      | name      | description          | price | category    | stock |
      | iPhone 15 | Latest Apple iPhone  | 999.99| Electronics | 50    |
    Then the response status should be 200
    And the response should contain product data with generated ID
    And the product should have name "iPhone 15"
    And the product should have price 999.99
    And the product should have stock 50

  Scenario: Retrieve all products
    Given there are existing products in the system
    When I send a GET request to "/products"
    Then the response status should be 200
    And the response should contain a list of products
    And each product should have required fields: id, name, description, price, category, stock, createdAt, updatedAt

  Scenario: Retrieve a specific product by ID
    Given a product exists with ID "product1"
    When I send a GET request to "/products/product1"
    Then the response status should be 200
    And the response should contain product data for ID "product1"

  Scenario: Retrieve a non-existent product
    When I send a GET request to "/products/nonexistent123"
    Then the response status should be 404
    And the response should contain error message "Product not found"

  Scenario: Update an existing product
    Given a product exists with ID "product1"
    When I send a PUT request to "/products/product1" with updated data:
      | name          | price | stock |
      | Updated Phone | 899.99| 25    |
    Then the response status should be 200
    And the response should contain updated product data
    And the product name should be "Updated Phone"
    And the product price should be 899.99
    And the product stock should be 25

  Scenario: Update product price only
    Given a product exists with ID "product1"
    When I send a PUT request to "/products/product1" with partial data:
      | price |
      | 799.99|
    Then the response status should be 200
    And the product price should be 799.99

  Scenario: Update a non-existent product
    When I send a PUT request to "/products/nonexistent123" with data:
      | name        | price |
      | Test Product| 99.99 |
    Then the response status should be 404
    And the response should contain error message "Product not found"

  Scenario: Delete an existing product
    Given a product exists with ID "product1"
    When I send a DELETE request to "/products/product1"
    Then the response status should be 200
    And the response should contain success message

  Scenario: Delete a non-existent product
    When I send a DELETE request to "/products/nonexistent123"
    Then the response status should be 404
    And the response should contain error message "Product not found"

  Scenario: Create product with invalid data
    When I send a POST request to "/products" with invalid data:
      | name | description | price | category | stock |
      |      |             |       |          |       |
    Then the response status should be 400
    And the response should contain error message "All product fields are required"

  Scenario: Create product with missing request body
    When I send a POST request to "/products" with no body
    Then the response status should be 400
    And the response should contain error message "Request body is required"

  Scenario: Verify product stock management
    Given a product exists with stock 10
    When I update the product stock to 0
    Then the product stock should be 0
    And the product should still be retrievable