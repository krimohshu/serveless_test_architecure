# API Documentation

## 📚 OpenAPI Specification

This project includes comprehensive OpenAPI 3.0 (Swagger) documentation for all REST APIs.

## 📖 Documentation Files

### OpenAPI Specification Files
- **`openapi.yaml`** - Complete API specification in YAML format (recommended)
- **`openapi.json`** - Complete API specification in JSON format

### Quick Links
- **Swagger Editor**: [Edit the spec online](https://editor.swagger.io/)
- **Live API Base URL**: `https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev`

## 🚀 Viewing the API Documentation

### Option 1: Swagger UI (Recommended)

#### Online Swagger Editor
1. Go to [https://editor.swagger.io/](https://editor.swagger.io/)
2. Click **File** → **Import file**
3. Select `openapi.yaml` from this repository
4. The interactive documentation will load automatically

#### Local Swagger UI
```bash
# Install swagger-ui globally
npm install -g swagger-ui-watcher

# View the documentation
swagger-ui-watcher openapi.yaml
```

This will open http://localhost:8080 with interactive API documentation.

### Option 2: Redoc

```bash
# Install redoc-cli
npm install -g redoc-cli

# Generate static HTML documentation
redoc-cli bundle openapi.yaml -o api-docs.html

# Open in browser
open api-docs.html
```

### Option 3: VS Code Extension

1. Install the **OpenAPI (Swagger) Editor** extension in VS Code
2. Open `openapi.yaml`
3. Click the preview icon in the top-right corner

### Option 4: Postman

1. Open Postman
2. Click **Import** → **File**
3. Select `openapi.yaml` or `openapi.json`
4. The entire API collection will be imported with examples

## 📋 API Overview

### Base URL
```
https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev
```

### Available APIs

#### 👤 User API
Manage user accounts and profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Create a new user |
| `GET` | `/users` | List all users |
| `GET` | `/users/{id}` | Get user by ID |
| `PUT` | `/users/{id}` | Update user |
| `DELETE` | `/users/{id}` | Delete user |

#### 📦 Product API
Manage product catalog with stock tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create a new product |
| `GET` | `/products` | List all products |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

#### 🛒 Order API
Process and manage customer orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create a new order |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get order by ID |
| `PUT` | `/orders/{id}` | Update order status/products |
| `DELETE` | `/orders/{id}` | Cancel and delete order |

## 🎯 Quick Start Examples

### Create a User
```bash
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_1729435200000_abc123",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "createdAt": "2025-10-20T10:30:00.000Z",
    "updatedAt": "2025-10-20T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

### Create a Product
```bash
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Pro",
    "description": "High-performance laptop with 16GB RAM",
    "price": 1299.99,
    "category": "Electronics",
    "stock": 50
  }'
```

### Create an Order
```bash
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "usr_1729435200000_abc123",
    "products": [
      {
        "productId": "prd_1729435200000_xyz789",
        "quantity": 1,
        "price": 1299.99
      }
    ]
  }'
```

### List All Users
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users
```

### Get Product by ID
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products/prd_1729435200000_xyz789
```

### Update Order Status
```bash
curl -X PUT https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders/ord_1729435400000_qwe456 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }'
```

## 📊 Response Format

### Success Response
All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔍 Data Models

### User
```typescript
{
  id: string;           // usr_1729435200000_abc123
  name: string;         // John Doe
  email: string;        // john.doe@example.com
  createdAt: string;    // 2025-10-20T10:30:00.000Z
  updatedAt: string;    // 2025-10-20T10:30:00.000Z
}
```

### Product
```typescript
{
  id: string;           // prd_1729435200000_xyz789
  name: string;         // Laptop Pro
  description: string;  // High-performance laptop
  price: number;        // 1299.99
  category: string;     // Electronics
  stock: number;        // 50
  createdAt: string;    // 2025-10-20T10:30:00.000Z
  updatedAt: string;    // 2025-10-20T10:30:00.000Z
}
```

### Order
```typescript
{
  id: string;           // ord_1729435400000_qwe456
  userId: string;       // usr_1729435200000_abc123
  products: OrderItem[];
  totalAmount: number;  // 1299.99
  status: OrderStatus;  // PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED
  createdAt: string;    // 2025-10-20T10:40:00.000Z
  updatedAt: string;    // 2025-10-20T10:40:00.000Z
}
```

### OrderItem
```typescript
{
  productId: string;    // prd_1729435200000_xyz789
  quantity: number;     // 2
  price: number;        // 1299.99
}
```

## 🎨 Features in OpenAPI Spec

### Comprehensive Documentation
- ✅ All endpoints documented
- ✅ Request/response schemas
- ✅ Multiple examples for each endpoint
- ✅ Validation rules (min/max, patterns, formats)
- ✅ Error response documentation

### Data Validation
- ✅ Required fields specified
- ✅ Format validation (email, date-time)
- ✅ Range validation (min/max values)
- ✅ Pattern matching (ID formats)
- ✅ Enum values (order status)

### Rich Examples
- ✅ Request body examples
- ✅ Success response examples
- ✅ Error response examples
- ✅ Multiple scenarios per endpoint

### Server Configuration
- ✅ Production server (AWS Lambda)
- ✅ Local development server
- ✅ Easy to switch between environments

## 🛠️ Testing with OpenAPI

### Generate Test Code

#### Using OpenAPI Generator
```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o generated/client

# Generate Python client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o generated/python-client
```

#### Using Swagger Codegen
```bash
# Generate JavaScript client
swagger-codegen generate \
  -i openapi.yaml \
  -l javascript \
  -o generated/js-client
```

### Import to Testing Tools

#### Postman
1. Import `openapi.yaml` or `openapi.json`
2. All endpoints imported as collection
3. Examples pre-populated
4. Ready to test immediately

#### Insomnia
1. Import `openapi.yaml`
2. Full API collection created
3. Request examples included

#### Paw (macOS)
1. Import OpenAPI file
2. Generate requests automatically

## 📦 Integration

### API Client Generation

Generate type-safe API clients for various languages:

```bash
# TypeScript
openapi-generator-cli generate -i openapi.yaml -g typescript-axios -o clients/typescript

# Python
openapi-generator-cli generate -i openapi.yaml -g python -o clients/python

# Java
openapi-generator-cli generate -i openapi.yaml -g java -o clients/java

# Go
openapi-generator-cli generate -i openapi.yaml -g go -o clients/go

# C#
openapi-generator-cli generate -i openapi.yaml -g csharp -o clients/csharp
```

### Frontend Integration

Use the generated clients in your frontend:

```typescript
import { UserApi, ProductApi, OrderApi } from './generated/client';

const userApi = new UserApi();
const users = await userApi.listUsers();
```

## 📝 Validation

### Validate OpenAPI Spec
```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate the spec
swagger-cli validate openapi.yaml
```

### Lint OpenAPI Spec
```bash
# Install spectral (OpenAPI linter)
npm install -g @stoplight/spectral-cli

# Lint the spec
spectral lint openapi.yaml
```

## 🔄 Keeping Documentation Updated

When you modify APIs:

1. **Update the OpenAPI spec** (`openapi.yaml`)
2. **Validate the spec**: `swagger-cli validate openapi.yaml`
3. **Regenerate clients** (if using code generation)
4. **Update this README** with new examples if needed

## 📚 Additional Resources

### OpenAPI Tools
- [Swagger Editor](https://editor.swagger.io/) - Online editor
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Interactive documentation
- [Redoc](https://redoc.ly/) - Beautiful API documentation
- [OpenAPI Generator](https://openapi-generator.tech/) - Code generation

### Learning Resources
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) - Official spec
- [Swagger Tutorial](https://swagger.io/docs/specification/about/) - Getting started
- [OpenAPI Best Practices](https://oai.github.io/Documentation/best-practices.html)

## 🆘 Support

For questions about the API documentation:
1. Check the OpenAPI spec: `openapi.yaml`
2. Review the examples in each endpoint
3. Test in Swagger UI for interactive exploration
4. See the main [README.md](./README.md) for project setup

---

**Happy API Development! 🚀**
