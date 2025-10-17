#!/bin/bash

# Alternative deployment script using AWS CLI
# This requires fewer permissions than CloudFormation

echo "Building TypeScript project..."
npm run build

echo "Creating deployment package..."
zip -r deployment.zip .build/ node_modules/ package.json

echo "Note: This script requires manual Lambda function creation"
echo "Please create Lambda functions manually in AWS Console or request CloudFormation permissions"

# Commands that would be needed (for reference):
# aws lambda create-function --function-name createUser --runtime nodejs18.x --role arn:aws:iam::ACCOUNT:role/lambda-execution-role --handler src/handlers/user.createUser --zip-file fileb://deployment.zip --profile evident
# aws lambda create-function --function-name getUser --runtime nodejs18.x --role arn:aws:iam::ACCOUNT:role/lambda-execution-role --handler src/handlers/user.getUser --zip-file fileb://deployment.zip --profile evident
# ... (repeat for all functions)

echo "Manual deployment steps:"
echo "1. Create Lambda execution role in IAM"
echo "2. Create Lambda functions for each handler"
echo "3. Create API Gateway and connect endpoints"
echo "4. Deploy API Gateway stage"