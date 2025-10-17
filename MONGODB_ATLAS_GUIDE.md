# MongoDB Atlas Integration Guide

## 🍃 **MongoDB Atlas for Serverless APIs**

MongoDB Atlas is MongoDB's cloud database service that can work with your serverless architecture.

## 📊 **Difficulty Assessment**

### **Setup Complexity: ⭐⭐ (Moderate)**

**Why Moderate:**
- ✅ Easy Atlas account setup
- ✅ Good documentation
- ❌ Requires connection string management
- ❌ Need to handle connection pooling properly

### **Dependencies Required:**

```json
{
  "dependencies": {
    "mongodb": "^6.3.0",
    "@types/mongodb": "^4.0.7"
  }
}
```

**Size Impact:** ~2.5MB added to Lambda package (moderate)

## 🔧 **Implementation Steps**

### **Step 1: MongoDB Atlas Setup**
1. Create account at `mongodb.com/atlas`
2. Create free cluster (M0 - 512MB storage)
3. Set up database user and IP whitelist
4. Get connection string

### **Step 2: Install Dependencies**
```bash
npm install mongodb @types/mongodb
```

### **Step 3: Update serverless.yml**
```yaml
provider:
  environment:
    MONGODB_URI: ${env:MONGODB_URI} # Set this in environment
```

### **Step 4: Create Database Service**
```typescript
// src/utils/mongoStore.ts
import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '../types/user';
import { Product } from '../types/product';
import { Order } from '../types/order';

let cachedDb: Db | null = null;

const connectToDatabase = async (): Promise<Db> => {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  
  cachedDb = client.db('serverless-apis');
  return cachedDb;
};

export const getUsersCollection = async (): Promise<Collection<User>> => {
  const db = await connectToDatabase();
  return db.collection<User>('users');
};

export const getProductsCollection = async (): Promise<Collection<Product>> => {
  const db = await connectToDatabase();
  return db.collection<Product>('products');
};

export const getOrdersCollection = async (): Promise<Collection<Order>> => {
  const db = await connectToDatabase();
  return db.collection<Order>('orders');
};
```

### **Step 5: Update Handlers (Example - User Service)**
```typescript
// src/handlers/user.ts - Updated for MongoDB
import { getUsersCollection } from '../utils/mongoStore';

export const createUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const request: CreateUserRequest = JSON.parse(event.body!);
    
    const user: User = {
      _id: new ObjectId(), // MongoDB uses _id
      name: request.name,
      email: request.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const collection = await getUsersCollection();
    await collection.insertOne(user);
    
    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const getUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    if (!id) {
      return createErrorResponse(400, 'User ID is required');
    }

    const collection = await getUsersCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return createErrorResponse(404, 'User not found');
    }

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};
```

## 📊 **Comparison: MongoDB Atlas vs Other Options**

| Aspect | MongoDB Atlas | DynamoDB | RDS PostgreSQL |
|--------|---------------|----------|----------------|
| **Setup Difficulty** | ⭐⭐ Moderate | ⭐⭐ Easy | ⭐⭐⭐ Complex |
| **Code Changes** | ⭐⭐⭐ Significant | ⭐⭐ Moderate | ⭐⭐⭐ Significant |
| **Package Size** | ⭐⭐ +2.5MB | ⭐⭐⭐ +500KB | ⭐⭐ +2MB |
| **Cold Start Impact** | ⭐⭐ Moderate | ⭐⭐⭐ Minimal | ⭐ High |
| **Free Tier** | ✅ 512MB | ✅ 25GB | ❌ No free tier |
| **Managed Service** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Query Flexibility** | ✅ Excellent | ⭐⭐ Limited | ✅ Excellent |
| **Cost (Production)** | ⭐⭐ Medium | ⭐⭐⭐ Low | ⭐⭐ Medium |
| **Serverless Native** | ⭐⭐ Good | ⭐⭐⭐ Excellent | ⭐ Fair |

## ⚡ **Performance Considerations**

### **Pros:**
- ✅ **Flexible Schema**: Easy to modify data structure
- ✅ **Rich Queries**: Complex aggregations and searches
- ✅ **JSON Native**: Natural fit for JavaScript/TypeScript
- ✅ **Atlas Search**: Built-in full-text search
- ✅ **Transactions**: ACID compliance

### **Cons:**
- ❌ **Cold Start**: Connection overhead (~100-300ms)
- ❌ **Connection Limits**: Need proper connection pooling
- ❌ **Package Size**: Larger Lambda deployment
- ❌ **Not Serverless Native**: Designed for always-on connections

## 💰 **Cost Analysis**

### **MongoDB Atlas Pricing:**
- **Free Tier**: M0 cluster (512MB, 100 connections) - FREE
- **Basic**: M2 cluster ($9/month) - 2GB storage
- **Production**: M10+ cluster ($57/month+) - 10GB+ storage

### **Compared to DynamoDB:**
- **DynamoDB**: Pay per request (very low cost for small apps)
- **Atlas**: Fixed monthly cost regardless of usage

## 🎯 **Recommendation for Your Use Case**

### **Choose MongoDB Atlas IF:**
- ✅ You're familiar with MongoDB/NoSQL
- ✅ You need complex queries or aggregations
- ✅ You plan to add full-text search later
- ✅ Your data has complex relationships
- ✅ You want document-based storage

### **Choose DynamoDB IF:**
- ✅ You want true serverless (no connection management)
- ✅ You prioritize minimal cold starts
- ✅ Simple key-value or basic queries are sufficient
- ✅ You want the lowest operational overhead
- ✅ Cost optimization is important

## 🚀 **Quick Start with MongoDB Atlas**

**Time Investment:**
- **Setup**: 30-60 minutes
- **Code Migration**: 2-4 hours
- **Testing**: 1-2 hours
- **Total**: Half day of work

**Migration Complexity:**
- **Low Risk**: Atlas handles database management
- **Moderate Effort**: Rewrite data access layer
- **High Reward**: Flexible, powerful database

## 💡 **My Recommendation**

For your current serverless TypeScript APIs:

**1st Choice: DynamoDB** - Perfect serverless fit, minimal complexity
**2nd Choice: MongoDB Atlas** - If you need complex queries or are MongoDB-experienced
**3rd Choice: RDS** - Only if you absolutely need SQL

Would you like me to help you implement MongoDB Atlas integration or would you prefer to stick with DynamoDB for better serverless optimization?