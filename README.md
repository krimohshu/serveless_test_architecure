# Serverless TypeScript REST APIs

This project contains three REST APIs built with TypeScript, AWS Lambda, and API Gateway:
- **User Service**: Single Lambda handling all user CRUD operations
- **Product Service**: Single Lambda handling all product CRUD operations
- **Orders Service**: Single Lambda handling all order CRUD operations

## Architecture

- **Runtime**: Node.js 18.x
- **Language**: TypeScript
- **Infrastructure**: 3 AWS Lambda functions + API Gateway
- **Deployment**: Serverless Framework
- **AWS Profile**: evident
- **Region**: eu-west-2 (London)

## Lambda Functions

Instead of 15 separate functions, this architecture uses **only 3 consolidated Lambda functions**:

1. **userService** - Handles all `/users` endpoints
2. **productService** - Handles all `/products` endpoints  
3. **orderService** - Handles all `/orders` endpoints

Each Lambda function routes requests internally based on HTTP method and path parameters.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- AWS CLI configured with 'evident' profile
- Serverless Framework

## Installation

```bash
npm install
```

## Development

### Local Development
```bash
npm run offline
```

This will start the APIs locally at `http://localhost:3000`

### Build
```bash
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

## Project Structure

```
src/
├── handlers/          # Lambda function handlers
│   ├── user.ts        # User service functions
│   ├── product.ts     # Product service functions
│   └── order.ts       # Order service functions
├── types/             # TypeScript type definitions
│   ├── user.ts
│   ├── product.ts
│   └── order.ts
└── utils/             # Utility functions
    ├── response.ts    # HTTP response helpers
    └── dataStore.ts   # In-memory data store (replace with DB)
```

## Notes

- This project uses an in-memory data store for demonstration purposes
- In production, replace the data store with a proper database (DynamoDB, RDS, etc.)
- All APIs include CORS support
- Error handling and validation are implemented
- The project is configured to deploy using the 'evident' AWS profile