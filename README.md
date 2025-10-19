# Serverless TypeScript REST APIs with BDD Testing Framework

[![GitHub](https://img.shields.io/badge/GitHub-krimohshu%2Fserveless__test__architecure-blue)](https://github.com/krimohshu/serveless_test_architecure)
[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange)](https://aws.amazon.com/lambda/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Serverless](https://img.shields.io/badge/Serverless-Framework-red)](https://www.serverless.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)

A production-ready serverless REST API project with **comprehensive BDD testing framework** using TypeScript, AWS Lambda, and API Gateway.

## 🏗️ Architecture Overview

This project implements a **modern serverless testing architecture** with 3 REST APIs and 4 test Lambda functions orchestrated for parallel testing:

### **API Services** (3 Lambda Functions)
- **User Service** - Single Lambda handling all user CRUD operations
- **Product Service** - Single Lambda handling all product CRUD operations
- **Orders Service** - Single Lambda handling all order CRUD operations

### **Testing Infrastructure** (4 Lambda Functions)
- **Test Orchestrator** - Master Lambda that runs all test functions in parallel
- **User Test Runner** - Executes BDD tests for User API (8+ scenarios)
- **Product Test Runner** - Executes BDD tests for Product API (11+ scenarios)
- **Order Test Runner** - Executes BDD tests for Order API (15+ scenarios)

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (REST)                      │
└─────────────────────────────────────────────────────────────┘
           │                │                │
           ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐    ┌──────────┐
    │  User    │     │ Product  │    │  Order   │
    │ Lambda   │     │  Lambda  │    │  Lambda  │
    └──────────┘     └──────────┘    └──────────┘
           │                │                │
           └────────────────┴────────────────┘
                          │
                   ┌──────▼──────┐
                   │  In-Memory  │
                   │ Data Store  │
                   └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Test Orchestrator Lambda                   │
│                   (Parallel Execution)                      │
└─────────────────────────────────────────────────────────────┘
           │                │                │
           ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐    ┌──────────┐
    │User Test │     │Product   │    │Order Test│
    │  Lambda  │     │Test      │    │  Lambda  │
    │          │     │Lambda    │    │          │
    └──────────┘     └──────────┘    └──────────┘
           │                │                │
           └────────────────┴────────────────┘
                          │
                   ┌──────▼──────┐
                   │ Aggregated  │
                   │   Reports   │
                   └─────────────┘
```

## 🎯 Key Features

✅ **Optimized Lambda Architecture** - 3 consolidated functions instead of 15 separate ones  
✅ **BDD Testing Framework** - Cucumber feature files with 38+ comprehensive test scenarios  
✅ **Parallel Test Execution** - Test orchestrator runs all tests concurrently for speed  
✅ **Aggregated Reporting** - Consolidated test reports from all test functions  
✅ **TypeScript** - Full type safety and modern JavaScript features  
✅ **API Gateway Integration** - RESTful endpoints with CORS support  
✅ **In-memory Data Store** - Easy to migrate to DynamoDB or other databases  
✅ **Lambda-Native Testing** - Tests run as Lambda functions, not in CI/CD containers  

## 📊 Technical Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 18.x |
| **Language** | TypeScript | 5.3 |
| **Infrastructure** | AWS Lambda + API Gateway | - |
| **Deployment** | Serverless Framework | 3.38.0 |
| **Testing** | Cucumber BDD | 10.0.1 |
| **Assertions** | Chai | 4.4.1 |
| **HTTP Client** | Axios | 1.6.5 |
| **AWS SDK** | @aws-sdk/client-lambda | 3.x |
| **Profile** | evident | - |
| **Region** | eu-west-2 (London) | - |

## 🚀 Lambda Functions

Instead of 15 separate functions, this architecture uses **only 3 consolidated Lambda functions** for the API:

### API Lambdas

1. **userService** - Handles all `/users` endpoints
   - `POST /users` - Create user
   - `GET /users` - List users
   - `GET /users/{id}` - Get user by ID
   - `PUT /users/{id}` - Update user
   - `DELETE /users/{id}` - Delete user

2. **productService** - Handles all `/products` endpoints
   - `POST /products` - Create product
   - `GET /products` - List products
   - `GET /products/{id}` - Get product by ID
   - `PUT /products/{id}` - Update product
   - `DELETE /products/{id}` - Delete product

3. **orderService** - Handles all `/orders` endpoints
   - `POST /orders` - Create order (with validation)
   - `GET /orders` - List orders
   - `GET /orders/{id}` - Get order by ID
   - `PUT /orders/{id}` - Update order status
   - `DELETE /orders/{id}` - Delete order

### Test Lambdas

4. **testOrchestrator** - Coordinates parallel test execution
5. **userTestRunner** - Runs User API BDD tests
6. **productTestRunner** - Runs Product API BDD tests
7. **orderTestRunner** - Runs Order API BDD tests

Each Lambda function routes requests internally based on HTTP method and path parameters, reducing cold starts and simplifying management.

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

### Required IAM Permissions

The `evident` profile needs permissions for:
- Lambda function creation/update/invoke
- API Gateway management
- CloudWatch Logs
- IAM role management
- S3 (for test reports, optional)

See `required-iam-policy.json` for the complete IAM policy.

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

## 🚀 Deployment

### Deploy API Services to AWS

```bash
# Quick deploy using npm script
npm run deploy

# Or deploy directly with serverless
serverless deploy --aws-profile evident --region eu-west-2

# Use deployment helper script (checks prerequisites)
./deployment-helper.sh
```

The deployment will create:
- ✅ 3 Lambda functions (userService, productService, orderService)
- ✅ API Gateway REST API with 15 endpoints
- ✅ IAM roles and permissions
- ✅ CloudWatch log groups
- ✅ Environment configuration

### Deployment Output

After successful deployment, you'll receive your API endpoints:

```yaml
Service Information:
  service: serverless-rest-apis
  stage: dev
  region: eu-west-2
  stack: serverless-rest-apis-dev
  
endpoints:
  # User API
  POST   - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/users
  GET    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/users
  GET    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/users/{id}
  PUT    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/users/{id}
  DELETE - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/users/{id}
  
  # Product API
  POST   - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/products
  GET    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/products
  GET    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/products/{id}
  PUT    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/products/{id}
  DELETE - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/products/{id}
  
  # Order API
  POST   - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/orders
  GET    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/orders
  GET    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/orders/{id}
  PUT    - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/orders/{id}
  DELETE - https://xxxxx.execute-api.eu-west-2.amazonaws.com/dev/orders/{id}

functions:
  userService: serverless-rest-apis-dev-userService
  productService: serverless-rest-apis-dev-productService
  orderService: serverless-rest-apis-dev-orderService
```

### Current Live Deployment

**Live API Base URL**: `https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev`

Test the deployment:
```bash
# Get all users
curl https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users

# Create a new user
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### Deploy Test Infrastructure

```bash
# Deploy test Lambda functions (coming soon)
npm run deploy-tests

# Or manually deploy test stack
serverless deploy --config test/serverless-test.yml --aws-profile evident
```

### Remove Deployment

```bash
# Remove all resources from AWS
npm run remove

# Or use serverless directly
serverless remove --aws-profile evident --region eu-west-2
```

## 🧪 Testing

### BDD Test Scenarios

The project includes **38+ comprehensive BDD test scenarios**:

#### User API (10 scenarios)
- ✅ Create user with valid data
- ✅ Create user with missing required fields
- ✅ List all users
- ✅ Retrieve specific user by ID
- ✅ Update user information
- ✅ Delete user
- ✅ Handle non-existent user
- ✅ Validate email format
- ✅ Duplicate email prevention
- ✅ Empty user list handling

#### Product API (13 scenarios)
- ✅ Create product with all fields
- ✅ Create product with missing fields
- ✅ List all products
- ✅ Retrieve product by ID
- ✅ Update product details
- ✅ Partial product updates
- ✅ Delete product
- ✅ Handle non-existent product
- ✅ Stock level validation
- ✅ Price validation
- ✅ Category filtering
- ✅ Out-of-stock handling
- ✅ Bulk stock updates

#### Order API (15+ scenarios)
- ✅ Create valid order
- ✅ Order with non-existent user
- ✅ Order with non-existent product
- ✅ Insufficient stock handling
- ✅ Order status transitions
- ✅ Multiple products in order
- ✅ Order quantity validation
- ✅ Order total calculation
- ✅ Cancel order
- ✅ Complete order
- ✅ Refund order
- ✅ List user orders
- ✅ Filter by status
- ✅ Date range queries
- ✅ Stock decrement on order

### Running Tests

#### Local Cucumber Tests

```bash
# Run all Cucumber tests locally
npm run test:cucumber

# Run specific feature file
npm run test:cucumber -- test/features/user-api.feature

# Run with tags
npm run test:cucumber -- --tags "@smoke"
```

#### Lambda Test Execution

```bash
# Invoke Test Orchestrator (runs all tests in parallel)
npm run test:orchestrator

# Or invoke directly with AWS CLI
aws lambda invoke \
  --function-name serverless-rest-apis-dev-testOrchestrator \
  --profile evident \
  --region eu-west-2 \
  response.json

# View aggregated test results
cat response.json | jq .
```

#### 📊 HTML Test Reports on S3

**The test orchestrator automatically generates beautiful HTML reports and uploads them to S3!**

After running tests, you'll get a **public URL** that anyone on your team can access:

```json
{
  "reports": {
    "json": "s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-1760880344548.json",
    "html": "s3://serverless-test-reports-dev/test-reports/2025-10-19/consolidated-report-1760880344548.html",
    "htmlPublicUrl": "https://serverless-test-reports-dev.s3.eu-west-2.amazonaws.com/test-reports/2025-10-19/consolidated-report-1760880344548.html"
  }
}
```

**👉 Simply open the `htmlPublicUrl` in your browser!**

**Features:**
- ✅ **No AWS Credentials Needed** - Public read-only access
- ✅ **Beautiful UI** - Modern gradient design with responsive layout
- ✅ **Detailed Results** - Service breakdown, test details, performance metrics
- ✅ **Automatic Generation** - Created and uploaded on every test run
- ✅ **Team Access** - Share the URL with your entire team

**📖 For detailed information, see:** [S3_REPORT_ACCESS_GUIDE.md](./S3_REPORT_ACCESS_GUIDE.md)

#### Individual Test Lambda Invocation

```bash
# Test User API only
aws lambda invoke \
  --function-name serverless-rest-apis-dev-userTestRunner \
  --profile evident \
  --region eu-west-2 \
  user-test-results.json

# Test Product API only
aws lambda invoke \
  --function-name serverless-rest-apis-dev-productTestRunner \
  --profile evident \
  --region eu-west-2 \
  product-test-results.json

# Test Order API only
aws lambda invoke \
  --function-name serverless-rest-apis-dev-orderTestRunner \
  --profile evident \
  --region eu-west-2 \
  order-test-results.json
```

### Test Report Structure

The Test Orchestrator generates aggregated reports in this format:

```json
{
  "status": "success",
  "summary": {
    "totalScenarios": 38,
    "passedScenarios": 36,
    "failedScenarios": 2,
    "executionTime": "15.3s"
  },
  "results": [
    {
      "testFunction": "userTestRunner",
      "status": "success",
      "scenarios": 10,
      "passed": 10,
      "failed": 0,
      "executionTime": "5.1s"
    },
    {
      "testFunction": "productTestRunner",
      "status": "success",
      "scenarios": 13,
      "passed": 13,
      "failed": 0,
      "executionTime": "6.7s"
    },
    {
      "testFunction": "orderTestRunner",
      "status": "partial",
      "scenarios": 15,
      "passed": 13,
      "failed": 2,
      "executionTime": "8.9s",
      "errors": [
        {
          "scenario": "Handle insufficient stock",
          "error": "Expected 400 but got 500"
        }
      ]
    }
  ]
}
```

## 📚 API Documentation

### User API

#### Create User
```bash
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

# Response
{
  "id": "uuid-here",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### List Users
```bash
GET /users

# Response
[
  {
    "id": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### Get User by ID
```bash
GET /users/{id}

# Response
{
  "id": "user1",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update User
```bash
PUT /users/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

# Response
{
  "id": "user1",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

#### Delete User
```bash
DELETE /users/{id}

# Response
{
  "message": "User deleted successfully"
}
```

### Product API

#### Create Product
```bash
POST /products
Content-Type: application/json

{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50
}

# Response
{
  "id": "uuid-here",
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "category": "Electronics",
  "stock": 50,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Product Stock
```bash
PUT /products/{id}
Content-Type: application/json

{
  "stock": 45
}

# Response
{
  "id": "product1",
  "name": "Laptop",
  "stock": 45,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### Order API

#### Create Order
```bash
POST /orders
Content-Type: application/json

{
  "userId": "user1",
  "products": [
    {
      "productId": "product1",
      "quantity": 2,
      "price": 999.99
    }
  ]
}

# Response
{
  "id": "uuid-here",
  "userId": "user1",
  "products": [...],
  "total": 1999.98,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Order Status
```bash
PUT /orders/{id}
Content-Type: application/json

{
  "status": "completed"
}

# Response
{
  "id": "order1",
  "status": "completed",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

## 🛠️ Development

### Lint Code
```bash
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Format Code
```bash
npm run format

# Check formatting without changing files
npm run format:check
```

### Build TypeScript
```bash
npm run build

# Watch mode for development
npm run build:watch
```

### Run Local Tests
```bash
# Run Jest tests
npm test

# Run with coverage
npm run test:coverage

# Run Cucumber BDD tests
npm run test:cucumber
```

## 🔒 Security Considerations

- ✅ CORS enabled with configurable origins
- ✅ Input validation on all endpoints
- ✅ Type safety with TypeScript
- ✅ IAM roles with least privilege
- ⚠️ **In-memory storage** - Replace with secure database for production
- ⚠️ **No authentication** - Add API Gateway authorizers or Cognito
- ⚠️ **No rate limiting** - Configure API Gateway throttling
- ⚠️ **No encryption** - Enable encryption at rest for persistent data

## 📈 Performance Optimization

### Lambda Optimization
- **Consolidated functions** reduce cold starts (3 vs 15 functions)
- **Internal routing** is faster than API Gateway routing
- **Memory**: 256MB default (adjust per function if needed)
- **Timeout**: 30 seconds (configurable in serverless.yml)

### API Gateway Optimization
- **Binary media types** supported
- **Compression** enabled
- **Caching** can be enabled per stage
- **Throttling** configurable

### Cost Optimization
- **Pay per request** - No idle costs
- **Free tier eligible** - 1M requests/month free
- **Consolidated Lambdas** - Fewer function deployments
- **No database costs** - In-memory storage (consider DynamoDB)

## 🔄 Database Migration

The project currently uses in-memory storage. To migrate to a persistent database:

### Option 1: DynamoDB (Recommended)

```bash
# Install AWS SDK DynamoDB client
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# See DATABASE_MIGRATION_GUIDE.md for full instructions
```

### Option 2: MongoDB Atlas

```bash
# Install MongoDB driver
npm install mongodb

# See MONGODB_ATLAS_GUIDE.md for setup instructions
```

### Option 3: RDS/Aurora

```bash
# Install database driver (PostgreSQL example)
npm install pg

# Configure connection in serverless.yml
# Add VPC configuration for Lambda functions
```

## 🐛 Troubleshooting

### Common Issues

**CloudFormation Stack Stuck**
```bash
# Delete the stuck stack
aws cloudformation delete-stack \
  --stack-name serverless-rest-apis-dev \
  --profile evident \
  --region eu-west-2
```

**Permission Denied Errors**
```bash
# Verify AWS credentials
aws sts get-caller-identity --profile evident

# Check IAM permissions
aws iam get-user --profile evident
```

**Lambda Cold Starts**
- Enable Provisioned Concurrency
- Increase memory allocation
- Use Lambda SnapStart (Java 11+)

**API Gateway 504 Timeout**
- Increase Lambda timeout in serverless.yml
- Optimize database queries
- Add CloudWatch metrics

## 📖 Additional Documentation

- [API Testing Guide](./API_TESTING_GUIDE.md) - Comprehensive API testing instructions
- [Database Migration Guide](./DATABASE_MIGRATION_GUIDE.md) - Migrate from in-memory to persistent storage
- [MongoDB Atlas Guide](./MONGODB_ATLAS_GUIDE.md) - Set up MongoDB Atlas database
- [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Update documentation for new features
- Run linting and formatting before committing

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Krishan Shukla** - [GitHub](https://github.com/krimohshu)

## 🙏 Acknowledgments

- [Serverless Framework](https://www.serverless.com/) for the excellent deployment tool
- [AWS Lambda](https://aws.amazon.com/lambda/) for serverless compute
- [Cucumber](https://cucumber.io/) for BDD testing framework
- [TypeScript](https://www.typescriptlang.org/) for type safety

## 📞 Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/krimohshu/serveless_test_architecure/issues)
- Review the documentation guides
- Check AWS CloudWatch Logs for runtime errors

## 🗺️ Roadmap

- [ ] Deploy test infrastructure to AWS
- [ ] Add authentication with AWS Cognito
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] Create API documentation with Swagger/OpenAPI
- [ ] Add monitoring dashboards
- [ ] Implement CI/CD pipeline
- [ ] Add integration tests
- [ ] Performance testing suite
- [ ] Database migration utilities
- [ ] Multi-region deployment
- [ ] Blue/green deployment strategy

---

**Built with ❤️ using Serverless Framework and TypeScript**
