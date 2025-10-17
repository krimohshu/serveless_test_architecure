# Database Migration Guide

## 🗄️ **Current State: In-Memory Storage**

Your data is currently stored in Lambda memory (`src/utils/dataStore.ts`):
- ❌ **Not persistent** - data lost when Lambda restarts
- ❌ **Not shared** - each Lambda instance has separate data
- ✅ **Fast** - no network calls
- ✅ **Good for testing** - simple setup

## 🎯 **Production Database Options**

### **Option 1: Amazon DynamoDB (Recommended)**

**Best for**: Serverless, scalable, managed NoSQL database

**Benefits:**
- ✅ Fully managed (no server maintenance)
- ✅ Perfect for serverless architecture
- ✅ Auto-scaling
- ✅ Fast performance
- ✅ Pay per use

**Setup Steps:**
1. Add DynamoDB table to `serverless.yml`
2. Install AWS SDK: `npm install @aws-sdk/client-dynamodb`
3. Replace memory store with DynamoDB operations

### **Option 2: Amazon RDS (PostgreSQL/MySQL)**

**Best for**: Complex relational queries, existing SQL knowledge

**Benefits:**
- ✅ Full SQL support
- ✅ ACID transactions
- ✅ Complex relationships
- ❌ Requires VPC setup
- ❌ Higher cost (always running)

### **Option 3: MongoDB Atlas**

**Best for**: Flexible NoSQL, complex queries, document storage

**Benefits:**
- ✅ Flexible schema (easy to modify data structure)
- ✅ Rich query capabilities and aggregations
- ✅ JSON-native (perfect for JavaScript/TypeScript)
- ✅ Free tier available (512MB)
- ✅ Built-in full-text search
- ❌ Connection overhead (100-300ms cold start)
- ❌ Larger Lambda package size (+2.5MB)
- ❌ Fixed monthly cost vs pay-per-use

### **Option 4: Amazon Aurora Serverless**

**Best for**: SQL database with serverless scaling

**Benefits:**
- ✅ SQL database that scales to zero
- ✅ Auto-scaling like DynamoDB
- ✅ Compatible with PostgreSQL/MySQL
- ❌ More complex setup
- ❌ Higher cost than DynamoDB

## 🔄 **Quick Migration to DynamoDB**

### **Step 1: Update serverless.yml**
```yaml
provider:
  environment:
    USERS_TABLE: ${self:service}-users-${self:provider.stage}
    PRODUCTS_TABLE: ${self:service}-products-${self:provider.stage}
    ORDERS_TABLE: ${self:service}-orders-${self:provider.stage}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:table/*"

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.USERS_TABLE}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

### **Step 2: Install DynamoDB SDK**
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

### **Step 3: Update dataStore.ts**
```typescript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-2" });
const docClient = DynamoDBDocumentClient.from(client);

export const saveUser = async (user: User) => {
  await docClient.send(new PutCommand({
    TableName: process.env.USERS_TABLE,
    Item: user
  }));
};

export const getUser = async (id: string) => {
  const result = await docClient.send(new GetCommand({
    TableName: process.env.USERS_TABLE,
    Key: { id }
  }));
  return result.Item as User;
};
```

## 🔧 **Migration Difficulty**

| Database | Setup | Code Changes | Cost | Scalability | Cold Start |
|----------|-------|--------------|------|-------------|------------|
| **DynamoDB** | ⭐⭐ Easy | ⭐⭐ Moderate | ⭐⭐⭐ Low | ⭐⭐⭐ Excellent | ⭐⭐⭐ Fast |
| **MongoDB Atlas** | ⭐⭐ Moderate | ⭐⭐⭐ Significant | ⭐⭐ Medium | ⭐⭐⭐ Excellent | ⭐⭐ Slower |
| **RDS** | ⭐⭐⭐ Complex | ⭐⭐⭐ Significant | ⭐⭐ Medium | ⭐⭐ Good | ⭐ Slow |
| **Aurora Serverless** | ⭐⭐⭐ Complex | ⭐⭐⭐ Significant | ⭐⭐ Medium | ⭐⭐⭐ Excellent | ⭐⭐ Moderate |

## 💡 **Recommendation**

For your serverless TypeScript APIs, **DynamoDB is the best choice** because:
- Seamlessly integrates with Lambda
- No server management required  
- Scales automatically with your traffic
- Pay only for what you use
- Perfect for your current data structure

Would you like me to help you migrate to DynamoDB?