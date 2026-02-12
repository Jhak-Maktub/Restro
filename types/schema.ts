export type UUID = string;
export type DateTime = string; // ISO 8601

// ENUMS
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD' | 'MPESA' | 'EMOLA';
export type StockUnit = 'KG' | 'L' | 'UNIT' | 'PACK';
export type RoleType = 'OWNER' | 'MANAGER' | 'WAITER' | 'CHEF' | 'CASHIER';
export type PlanType = 'STARTER' | 'PRO' | 'PREMIUM';

// 1. TENANCY & AUTH
export interface Tenant {
  id: UUID;
  name: string;
  slug: string;
  address: string;
  phone: string;
  logoUrl?: string;
  currency: string;
  plan: PlanType;
  trialEndsAt?: DateTime; // Data de fim do teste grátis
  isDemo?: boolean;       // Flag para conta de demonstração (read-only)
  createdAt: DateTime;
}

export interface User {
  id: UUID;
  tenantId: UUID;
  name: string;
  email: string;
  role: RoleType;
  avatarUrl?: string;
  passwordHash?: string; // In real DB
}

// 2. MENU & PRODUCTS
export interface Category {
  id: UUID;
  tenantId: UUID;
  name: string;
  icon?: string;
  sortOrder: number;
}

export interface Product {
  id: UUID;
  tenantId: UUID;
  categoryId: UUID;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTimeMinutes: number;
}

// 3. INVENTORY (ESTOQUE)
export interface Supplier {
  id: UUID;
  tenantId: UUID;
  name: string;
  contact: string;
  email?: string;
}

export interface Ingredient {
  id: UUID;
  tenantId: UUID;
  name: string;
  unit: StockUnit;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
  supplierId?: UUID;
  lastRestocked: DateTime;
}

// FICHA TÉCNICA (Receita)
// Relaciona um Produto vendido a Ingredientes consumidos
export interface ProductRecipe {
  productId: UUID;
  ingredientId: UUID;
  quantityRequired: number; // Quantidade do ingrediente usada para 1 unidade do produto
}

// 4. OPERATIONS
export interface Table {
  id: UUID;
  tenantId: UUID;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  reservationName?: string; // Who reserved it
  reservationTime?: DateTime; // When is it reserved for
}

export interface Order {
  id: UUID;
  tenantId: UUID;
  tableId?: UUID; // Null if delivery/takeaway
  waiterId?: UUID;
  customerId?: UUID;
  type: OrderType;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING';
  createdAt: DateTime;
  closedAt?: DateTime;
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID;
  quantity: number;
  unitPrice: number; // Price at the moment of purchase
  notes?: string; // "Sem cebola", etc.
  status: 'QUEUED' | 'COOKING' | 'DONE';
}

// 5. CUSTOMERS & CRM
export interface Customer {
  id: UUID;
  tenantId: UUID;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  lastOrderDate?: DateTime;
}

// 6. HR (RECURSOS HUMANOS)
export interface Employee {
  id: UUID;
  tenantId: UUID;
  userId?: UUID; // Link to login user if applicable
  fullName: string;
  role: RoleType;
  baseSalary: number;
  commissionRate: number; // %
  hiredDate: DateTime;
}