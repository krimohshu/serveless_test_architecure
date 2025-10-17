#!/bin/bash

echo "🚀 Manual Deployment Script for TypeScript Serverless APIs"
echo "==========================================================="

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile evident --region eu-west-2 > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured for 'evident' profile"
    exit 1
fi

echo "✅ AWS CLI configured successfully"

# Build the project
echo "📦 Building TypeScript project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Create deployment package
echo "📦 Creating deployment package..."
zip -r deployment.zip .build/ node_modules/ package.json > /dev/null 2>&1

echo "✅ Deployment package created"

# Display next steps
echo ""
echo "🎯 DEPLOYMENT OPTIONS:"
echo "====================="
echo ""
echo "Option 1: Request Additional Permissions"
echo "----------------------------------------"
echo "Ask your AWS administrator to add these permissions to your user:"
echo "- logs:TagResource"
echo "- cloudformation:* (full access)"
echo "- Or attach the AWSCloudFormationFullAccess policy"
echo ""
echo "Option 2: Manual AWS Console Setup"
echo "----------------------------------"
echo "1. Go to AWS Lambda Console (eu-west-2)"
echo "2. Create functions manually using the handlers in src/handlers/"
echo "3. Upload deployment.zip to each function"
echo "4. Create API Gateway manually and connect endpoints"
echo ""
echo "Option 3: Use AWS CDK Instead"
echo "----------------------------"
echo "Consider migrating to AWS CDK which might have different permission requirements"
echo ""
echo "📁 Files ready for deployment:"
echo "- deployment.zip (Lambda function code)"
echo "- serverless.yml (infrastructure definition)"
echo "- All handlers in src/handlers/"

# Clean up
rm -f deployment.zip

echo ""
echo "🔧 To retry serverless deployment after getting permissions:"
echo "npm run deploy"