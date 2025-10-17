import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Order, CreateOrderRequest, UpdateOrderRequest, OrderStatus } from '../types/order';
import { orders, users, products } from '../utils/dataStore';
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

    console.log(`Order Service - Method: ${httpMethod}, Path: ${event.path}, HasId: ${!!hasId}`);

    switch (httpMethod) {
      case 'POST':
        return await createOrder(event, context);
      case 'GET':
        if (hasId) {
          return await getOrder(event, context);
        } else {
          return await listOrders(event, context);
        }
      case 'PUT':
        return await updateOrder(event, context);
      case 'DELETE':
        return await deleteOrder(event, context);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error in order handler:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const createOrder = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const request: CreateOrderRequest = JSON.parse(event.body);
    
    if (!request.userId || !request.products || request.products.length === 0) {
      return createErrorResponse(400, 'User ID and products are required');
    }

    // Verify user exists
    const user = users.get(request.userId);
    if (!user) {
      return createErrorResponse(404, 'User not found');
    }

    // Verify products exist and calculate total
    let totalAmount = 0;
    for (const item of request.products) {
      const product = products.get(item.productId);
      if (!product) {
        return createErrorResponse(404, `Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        return createErrorResponse(400, `Insufficient stock for product ${item.productId}`);
      }
      totalAmount += item.price * item.quantity;
    }

    const id = generateId();
    const now = getCurrentTimestamp();
    
    const order: Order = {
      id,
      userId: request.userId,
      products: request.products,
      totalAmount,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    orders.set(id, order);
    return createSuccessResponse(order);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const getOrder = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Order ID is required');
    }

    const order = orders.get(id);
    
    if (!order) {
      return createErrorResponse(404, 'Order not found');
    }

    return createSuccessResponse(order);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const updateOrder = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Order ID is required');
    }

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const order = orders.get(id);
    
    if (!order) {
      return createErrorResponse(404, 'Order not found');
    }

    const request: UpdateOrderRequest = JSON.parse(event.body);
    
    let totalAmount = order.totalAmount;
    
    // Recalculate total if products are updated
    if (request.products) {
      totalAmount = 0;
      for (const item of request.products) {
        const product = products.get(item.productId);
        if (!product) {
          return createErrorResponse(404, `Product ${item.productId} not found`);
        }
        totalAmount += item.price * item.quantity;
      }
    }
    
    const updatedOrder: Order = {
      ...order,
      ...(request.status && { status: request.status }),
      ...(request.products && { products: request.products, totalAmount }),
      updatedAt: getCurrentTimestamp(),
    };

    orders.set(id, updatedOrder);
    return createSuccessResponse(updatedOrder);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const deleteOrder = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'Order ID is required');
    }

    const order = orders.get(id);
    
    if (!order) {
      return createErrorResponse(404, 'Order not found');
    }

    orders.delete(id);
    return createSuccessResponse({ message: 'Order deleted successfully' });
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const listOrders = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const orderList = Array.from(orders.values());
    return createSuccessResponse(orderList);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};