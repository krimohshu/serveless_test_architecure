# Serverless TypeScript REST APIs with BDD Testing Framework

[![GitHub](https://img.shields.io/badge/GitHub-krimohshu%2Fserveless__test__architecure-blue)](https://github.com/krimohshu/serveless_test_architecure)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Serverless](https://img.shields.io/badge/Serverless-Framework-red)](https://www.serverless.com/)

A production-ready serverless REST API project with **comprehensive BDD testing framework** using TypeScript, AWS Lambda, and API Gateway.

## 🏗️ Architecture Overview

This project contains **3 REST APIs** with **4 test Lambda functions** orchestrated for parallel testing:

### **API Services** (3 Lambda Functions)
- **User Service** - Single Lambda handling all user CRUD operations
- **Product Service** - Single Lambda handling all product CRUD operations
- **Orders Service** - Single Lambda handling all order CRUD operations

### **Testing Infrastructure** (4 Lambda Functions)
- **Test Orchestrator** - Master Lambda that runs all test functions in parallel
- **User Test Runner** - Executes BDD tests for User API
- **Product Test Runner** - Executes BDD tests for Product API
- **Order Test Runner** - Executes BDD tests for Order API

## 🎯 Key Features

✅ **Optimized Lambda Architecture** - 3 consolidated functions instead of 15 separate ones  
✅ **BDD Testing Framework** - Cucumber feature files with comprehensive test scenarios  
✅ **Parallel Test Execution** - Test orchestrator runs all tests concurrently  
✅ **Aggregated Reporting** - Consolidated test reports from all test functions  
✅ **TypeScript** - Full type safety and modern JavaScript features  
✅ **API Gateway Integration** - RESTful endpoints with CORS support  
✅ **In-memory Data Store** - Easy to migrate to DynamoDB or other databases  

## 📊 Technical Stack

- **Runtime**: Node.js 18.x
- **Language**: TypeScript 5.3
- **Infrastructure**: AWS Lambda + API Gateway
- **Deployment**: Serverless Framework 3.x
- **Testing**: Cucumber BDD + Axios + Chai
- **AWS Profile**: evident
- **Region**: eu-west-2 (London)

## 🚀 Lambda Functions

Instead of 15 separate functions, this architecture uses **only 3 consolidated Lambda functions**:

1. **userService** - Handles all `/users` endpoints (GET, POST, PUT, DELETE)
2. **productService** - Handles all `/products` endpoints (GET, POST, PUT, DELETE)
3. **orderService** - Handles all `/orders` endpoints (GET, POST, PUT, DELETE)

Each Lambda function routes requests internally based on HTTP method and path parameters, reducing cold starts and simplifying management.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **AWS CLI** configured with credentials ([Setup Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html))
- **Serverless Framework** 3.x: `npm install -g serverless`
- **AWS Profile** 'evident' configured in `~/.aws/credentials`
- **GitHub CLI** (optional): `gh` for repository operations

### AWS Profile Configuration

Ensure your `~/.aws/credentials` file contains the `evident` profile:

```ini
[evident]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
region = eu-west-2
```

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/krimohshu/serveless_test_architecure.git
cd serveless_test_architecure

# Install dependencies
npm install

# Compile TypeScript
npm run build
```

### Lint
```bash
npm run lint
```

### Format
```bash
npm run format
```

### Test
```bash
npm test
```

## Deployment

### Deploy to AWS
```bash
npm run deploy
```

### Remove from AWS
```bash
npm run remove
```

## API Endpoints

### User Service
- `POST /users` - Create a new user
- `GET /users` - List all users
- `GET /users/{id}` - Get user by ID
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Product Service
- `POST /products` - Create a new product
- `GET /products` - List all products
- `GET /products/{id}` - Get product by ID
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### Orders Service
- `POST /orders` - Create a new order
- `GET /orders` - List all orders
- `GET /orders/{id}` - Get order by ID
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order

## Example Requests

### Create User
```bash
curl -X POST https://your-api-gateway-url/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Create Product
```bash
curl -X POST https://your-api-gateway-url/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 50
  }'
```

### Create Order
```bash
curl -X POST https://your-api-gateway-url/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "products": [
      {
        "productId": "product1",
        "quantity": 2,
        "price": 999.99
      }
    ]
  }'
```

## 📁 Project Structure

```
code_v2/
├── src/
│   ├── handlers/           # API Lambda function handlers
│   │   ├── user.ts        # User service handler (1 Lambda, 5 operations)
│   │   ├── product.ts     # Product service handler (1 Lambda, 5 operations)
│   │   └── order.ts       # Order service handler (1 Lambda, 5 operations)
│   ├── types/             # TypeScript type definitions
│   │   ├── user.ts        # User interface & types
│   │   ├── product.ts     # Product interface & types
│   │   └── order.ts       # Order interface & types
│   └── utils/             # Shared utilities
│       ├── dataStore.ts   # In-memory data storage (Map-based)
│       └── response.ts    # HTTP response helpers
│
├── test/
│   ├── orchestrator/      # Master test coordinator
│   │   └── handler.ts     # Orchestrator Lambda (runs tests in parallel)
│   ├── lambdas/           # Individual test Lambda functions
│   │   ├── user-test.ts   # User API test runner (8+ scenarios)
│   │   ├── product-test.ts # Product API test runner (11+ scenarios)
│   │   └── order-test.ts  # Order API test runner (15+ scenarios)
│   ├── features/          # Cucumber BDD feature files
│   │   ├── user-api.feature    # 10 User API scenarios
│   │   ├── product-api.feature # 13 Product API scenarios
│   │   └── order-api.feature   # 15+ Order API scenarios
│   ├── step-definitions/  # Cucumber step implementations
│   │   ├── common-steps.ts # Shared step definitions
│   │   └── user-steps.ts  # User-specific steps
│   └── reports/           # Test execution reports (generated)
│
├── serverless.yml         # API services infrastructure config
├── package.json           # Dependencies & npm scripts
├── tsconfig.json          # TypeScript compiler configuration
├── jest.config.js         # Jest test configuration
├── deployment-helper.sh   # Deployment automation script
├── manual-deploy.sh       # Manual deployment script
├── required-iam-policy.json # IAM permissions required
│
└── docs/                  # Documentation
    ├── API_TESTING_GUIDE.md      # API testing instructions
    ├── DATABASE_MIGRATION_GUIDE.md # DB migration guide
    └── MONGODB_ATLAS_GUIDE.md     # MongoDB setup guide
```

## Notes

- This project uses an in-memory data store for demonstration purposes
- In production, replace the data store with a proper database (DynamoDB, RDS, etc.)
- All APIs include CORS support
- Error handling and validation are implemented
- The project is configured to deploy using the 'evident' AWS profile