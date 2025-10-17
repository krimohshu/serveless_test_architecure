import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';
import { products } from '../utils/dataStore';
import { createSuccessResponse, createErrorResponse, generateId, getCurrentTimestamp } from '../utils/response';

// Main handler function that routes to appropriate CRUD operation
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters;
    const hasId = pathParameters && pathParameters.id;

    console.log(`Product Service - Method: ${httpMethod}, Path: ${event.path}, HasId: ${!!hasId}`);

    switch (httpMethod) {
      case 'POST':
        return await createProduct(event, context);
      case 'GET':
        if (hasId) {
          return await getProduct(event, context);
        } else {
          return await listProducts(event, context);
        }
      case 'PUT':
        return await updateProduct(event, context);
      case 'DELETE':
        return await deleteProduct(event, context);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error in product handler:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const createProduct = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const request: CreateProductRequest = JSON.parse(event.body);
    
    if (!request.name || !request.description || request.price === undefined || !request.category || request.stock === undefined) {
      return createErrorResponse(400, 'All product fields are required');
    }

    const id = generateId();
    const now = getCurrentTimestamp();
    
    const product: Product = {
      id,
      name: request.name,
      description: request.description,
      price: request.price,
      category: request.category,
      stock: request.stock,
      createdAt: now,
      updatedAt: now,
    };

    products.set(id, product);
    return createSuccessResponse(product);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const getProduct = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Product ID is required');
    }

    const product = products.get(id);
    
    if (!product) {
      return createErrorResponse(404, 'Product not found');
    }

    return createSuccessResponse(product);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const updateProduct = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Product ID is required');
    }

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const product = products.get(id);
    
    if (!product) {
      return createErrorResponse(404, 'Product not found');
    }

    const request: UpdateProductRequest = JSON.parse(event.body);
    
    const updatedProduct: Product = {
      ...product,
      ...(request.name && { name: request.name }),
      ...(request.description && { description: request.description }),
      ...(request.price !== undefined && { price: request.price }),
      ...(request.category && { category: request.category }),
      ...(request.stock !== undefined && { stock: request.stock }),
      updatedAt: getCurrentTimestamp(),
    };

    products.set(id, updatedProduct);
    return createSuccessResponse(updatedProduct);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const deleteProduct = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Product ID is required');
    }

    const product = products.get(id);
    
    if (!product) {
      return createErrorResponse(404, 'Product not found');
    }

    products.delete(id);
    return createSuccessResponse({ message: 'Product deleted successfully' });
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const listProducts = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const productList = Array.from(products.values());
    return createSuccessResponse(productList);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};