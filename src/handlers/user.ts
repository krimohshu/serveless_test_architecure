import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/user';
import { users } from '../utils/dataStore';
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

    console.log(`User Service - Method: ${httpMethod}, Path: ${event.path}, HasId: ${!!hasId}`);

    switch (httpMethod) {
      case 'POST':
        return await createUser(event, context);
      case 'GET':
        if (hasId) {
          return await getUser(event, context);
        } else {
          return await listUsers(event, context);
        }
      case 'PUT':
        return await updateUser(event, context);
      case 'DELETE':
        return await deleteUser(event, context);
      default:
        return createErrorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error in user handler:', error);
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const createUser = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const request: CreateUserRequest = JSON.parse(event.body);
    
    if (!request.name || !request.email) {
      return createErrorResponse(400, 'Name and email are required');
    }

    const id = generateId();
    const now = getCurrentTimestamp();
    
    const user: User = {
      id,
      name: request.name,
      email: request.email,
      createdAt: now,
      updatedAt: now,
    };

    users.set(id, user);
    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const getUser = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'User ID is required');
    }

    const user = users.get(id);
    
    if (!user) {
      return createErrorResponse(404, 'User not found');
    }

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const updateUser = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'User ID is required');
    }

    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const user = users.get(id);
    
    if (!user) {
      return createErrorResponse(404, 'User not found');
    }

    const request: UpdateUserRequest = JSON.parse(event.body);
    
    const updatedUser: User = {
      ...user,
      ...(request.name && { name: request.name }),
      ...(request.email && { email: request.email }),
      updatedAt: getCurrentTimestamp(),
    };

    users.set(id, updatedUser);
    return createSuccessResponse(updatedUser);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const deleteUser = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    
    if (!id) {
      return createErrorResponse(400, 'User ID is required');
    }

    const user = users.get(id);
    
    if (!user) {
      return createErrorResponse(404, 'User not found');
    }

    users.delete(id);
    return createSuccessResponse({ message: 'User deleted successfully' });
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};

export const listUsers = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const userList = Array.from(users.values());
    return createSuccessResponse(userList);
  } catch (error) {
    return createErrorResponse(500, 'Internal server error', error);
  }
};