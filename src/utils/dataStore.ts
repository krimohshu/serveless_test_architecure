import { User } from '../types/user';
import { Product } from '../types/product';
import { Order } from '../types/order';

// In-memory data stores (replace with actual database in production)
export const users: Map<string, User> = new Map();
export const products: Map<string, Product> = new Map();
export const orders: Map<string, Order> = new Map();

// Initialize with some sample data
export const initializeData = () => {
  // Sample users
  const sampleUser: User = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.set(sampleUser.id, sampleUser);

  // Sample products
  const sampleProduct: Product = {
    id: 'product1',
    name: 'Sample Product',
    description: 'A sample product for testing',
    price: 29.99,
    category: 'Electronics',
    stock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.set(sampleProduct.id, sampleProduct);
};

// Initialize data on module load
initializeData();