# API Testing Guide

## 🌐 **API Base URL**
```
https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev
```

## 🧪 **Testing Methods**

### **Method 1: Using curl (Command Line)**

#### **User Service Tests**

**1. Create a User**
```bash
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

**2. Get All Users**
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users
```

**3. Get User by ID** (replace `user_id` with actual ID from create response)
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users/{user_id}
```

**4. Update a User**
```bash
curl -X PUT https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users/{user_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com"
  }'
```

**5. Delete a User**
```bash
curl -X DELETE https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users/{user_id}
```

#### **Product Service Tests**

**1. Create a Product**
```bash
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "Apple MacBook Pro 16-inch",
    "price": 2499.99,
    "category": "Electronics",
    "stock": 10
  }'
```

**2. Get All Products**
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products
```

**3. Get Product by ID**
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products/{product_id}
```

**4. Update a Product**
```bash
curl -X PUT https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products/{product_id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2299.99,
    "stock": 8
  }'
```

**5. Delete a Product**
```bash
curl -X DELETE https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products/{product_id}
```

#### **Order Service Tests**

**1. Create an Order**
```bash
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{user_id}",
    "products": [
      {
        "productId": "{product_id}",
        "quantity": 2,
        "price": 2299.99
      }
    ]
  }'
```

**2. Get All Orders**
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders
```

**3. Get Order by ID**
```bash
curl -X GET https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders/{order_id}
```

**4. Update an Order**
```bash
curl -X PUT https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders/{order_id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PROCESSING"
  }'
```

**5. Delete an Order**
```bash
curl -X DELETE https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders/{order_id}
```

### **Method 2: Using Postman**

1. **Import Collection**: Create a new Postman collection
2. **Set Base URL**: `https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev`
3. **Add requests** for each endpoint above
4. **Set Headers**: `Content-Type: application/json` for POST/PUT requests

### **Method 3: Using AWS Console**

1. **Go to Lambda Console**: `https://eu-west-2.console.aws.amazon.com/lambda`
2. **Find your functions**: userService, productService, orderService
3. **Test individual functions**: Use the "Test" tab with sample events
4. **View Logs**: Check CloudWatch Logs for debugging

### **Method 4: Using Browser (GET requests only)**

For GET requests, you can test directly in browser:
- All Users: `https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users`
- All Products: `https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products`
- All Orders: `https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders`

## 📊 **Monitoring & Debugging**

### **CloudWatch Logs**
```bash
# View Lambda logs
aws logs describe-log-groups --profile evident --region eu-west-2 --log-group-name-prefix "/aws/lambda/serverless-typescript-apis-dev"

# Get recent logs for userService
aws logs filter-log-events --profile evident --region eu-west-2 --log-group-name "/aws/lambda/serverless-typescript-apis-dev-userService" --start-time $(date -d '1 hour ago' +%s)000
```

### **API Gateway Logs**
- Enable API Gateway logging in AWS Console
- Check CloudWatch for API Gateway execution logs

## 🔍 **Testing Workflow**

1. **Start with Users**: Create a user first
2. **Then Products**: Create some products
3. **Finally Orders**: Create orders using user and product IDs
4. **Test CRUD**: Try all operations (Create, Read, Update, Delete)
5. **Check Logs**: Monitor CloudWatch for any errors

## 📝 **Sample Test Sequence**

```bash
# 1. Create user and save ID
USER_RESPONSE=$(curl -s -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/users -H "Content-Type: application/json" -d '{"name": "Test User", "email": "test@example.com"}')
USER_ID=$(echo $USER_RESPONSE | jq -r '.data.id')

# 2. Create product and save ID  
PRODUCT_RESPONSE=$(curl -s -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/products -H "Content-Type: application/json" -d '{"name": "Test Product", "description": "Test", "price": 99.99, "category": "Test", "stock": 5}')
PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')

# 3. Create order using the IDs
curl -X POST https://kzkw4oz3mk.execute-api.eu-west-2.amazonaws.com/dev/orders \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\", \"products\": [{\"productId\": \"$PRODUCT_ID\", \"quantity\": 1, \"price\": 99.99}]}"
```

Your APIs are now live and ready for testing! 🚀