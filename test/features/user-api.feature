Feature: User API Testing
  As a client application
  I want to manage users through the User API
  So that I can perform CRUD operations on user data

  Background:
    Given the User API is available at the base URL

  Scenario: Create a new user
    When I send a POST request to "/users" with user data:
      | name     | email              |
      | John Doe | john.doe@test.com  |
    Then the response status should be 200
    And the response should contain user data with generated ID
    And the user should have name "John Doe"
    And the user should have email "john.doe@test.com"

  Scenario: Retrieve all users
    Given there are existing users in the system
    When I send a GET request to "/users"
    Then the response status should be 200
    And the response should contain a list of users
    And each user should have required fields: id, name, email, createdAt, updatedAt

  Scenario: Retrieve a specific user by ID
    Given a user exists with ID "user1"
    When I send a GET request to "/users/user1"
    Then the response status should be 200
    And the response should contain user data for ID "user1"

  Scenario: Retrieve a non-existent user
    When I send a GET request to "/users/nonexistent123"
    Then the response status should be 404
    And the response should contain error message "User not found"

  Scenario: Update an existing user
    Given a user exists with ID "user1"
    When I send a PUT request to "/users/user1" with updated data:
      | name       | email                |
      | Jane Smith | jane.smith@test.com  |
    Then the response status should be 200
    And the response should contain updated user data
    And the user name should be "Jane Smith"
    And the user email should be "jane.smith@test.com"

  Scenario: Update a non-existent user
    When I send a PUT request to "/users/nonexistent123" with data:
      | name     | email           |
      | Test User| test@test.com   |
    Then the response status should be 404
    And the response should contain error message "User not found"

  Scenario: Delete an existing user
    Given a user exists with ID "user1"
    When I send a DELETE request to "/users/user1"
    Then the response status should be 200
    And the response should contain success message

  Scenario: Delete a non-existent user
    When I send a DELETE request to "/users/nonexistent123"
    Then the response status should be 404
    And the response should contain error message "User not found"

  Scenario: Create user with invalid data
    When I send a POST request to "/users" with invalid data:
      | name | email |
      |      |       |
    Then the response status should be 400
    And the response should contain error message "Name and email are required"

  Scenario: Create user with missing request body
    When I send a POST request to "/users" with no body
    Then the response status should be 400
    And the response should contain error message "Request body is required"