import { 
  Tenant, User, Category, Product, Ingredient, 
  ProductRecipe, Table, Order, OrderItem, Employee, Customer 
} from '../types/schema';

// HELPER: Dates
const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

// 1. TENANT (O Restaurante)
export const currentTenant: Tenant = {
  id: 'tnt_01',
  name: 'Restaurante Villa Gourmet',
  slug: 'villa-gourmet',
  address: 'Av. 24 de Julho, Tete, Moçambique',
  phone: '+258 84 210 4725',
  currency: 'MZN',
  plan: 'STARTER', // Default plan for logic testing
  createdAt: '2025-01-01T00:00:00Z'
};

// 2. USERS (Autenticação)
export const users: User[] = [
  { id: 'usr_01', tenantId: 'tnt_01', name: 'Carlos Mendes', email: 'admin@villa.com', role: 'OWNER', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: 'usr_02', tenantId: 'tnt_01', name: 'Ana Silva', email: 'ana@villa.com', role: 'MANAGER', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: 'usr_03', tenantId: 'tnt_01', name: 'João Chef', email: 'joao@villa.com', role: 'CHEF', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  { id: 'usr_04', tenantId: 'tnt_01', name: 'Pedro Garçom', email: 'pedro@villa.com', role: 'WAITER', avatarUrl: 'https://i.pravatar.cc/150?u=4' },
];

// 3. CATEGORIES
export const categories: Category[] = [
  { id: 'cat_01', tenantId: 'tnt_01', name: 'Entradas & Petiscos', sortOrder: 1, icon: 'fa-bread-slice' },
  { id: 'cat_02', tenantId: 'tnt_01', name: 'Pratos Típicos', sortOrder: 2, icon: 'fa-utensils' },
  { id: 'cat_03', tenantId: 'tnt_01', name: 'Grelhados & Mariscos', sortOrder: 3, icon: 'fa-fire' },
  { id: 'cat_04', tenantId: 'tnt_01', name: 'Bebidas', sortOrder: 4, icon: 'fa-wine-glass' },
  { id: 'cat_05', tenantId: 'tnt_01', name: 'Sobremesas', sortOrder: 5, icon: 'fa-ice-cream' },
];

// 4. INGREDIENTS (Estoque)
export const ingredients: Ingredient[] = [
  // --- OK (GREEN) ---
  { id: 'ing_01', tenantId: 'tnt_01', name: 'Carne Bovina', unit: 'KG', currentStock: 15.5, minStockAlert: 5, costPerUnit: 450, lastRestocked: yesterday },
  { id: 'ing_02', tenantId: 'tnt_01', name: 'Arroz Basmati', unit: 'KG', currentStock: 40, minStockAlert: 10, costPerUnit: 90, lastRestocked: yesterday },
  { id: 'ing_04', tenantId: 'tnt_01', name: 'Cerveja 2M', unit: 'UNIT', currentStock: 120, minStockAlert: 24, costPerUnit: 50, lastRestocked: yesterday },
  { id: 'ing_06', tenantId: 'tnt_01', name: 'Farinha Trigo', unit: 'KG', currentStock: 25, minStockAlert: 5, costPerUnit: 40, lastRestocked: yesterday },
  { id: 'ing_08', tenantId: 'tnt_01', name: 'Amendoim', unit: 'KG', currentStock: 15, minStockAlert: 4, costPerUnit: 80, lastRestocked: yesterday },
  { id: 'ing_09', tenantId: 'tnt_01', name: 'Coco Ralado', unit: 'KG', currentStock: 12, minStockAlert: 2, costPerUnit: 100, lastRestocked: yesterday },
  
  // --- WARNING (YELLOW) ---
  { id: 'ing_07', tenantId: 'tnt_01', name: 'Folha de Mandioca', unit: 'KG', currentStock: 3.5, minStockAlert: 3, costPerUnit: 30, lastRestocked: yesterday }, 
  { id: 'ing_11', tenantId: 'tnt_01', name: 'Cebola', unit: 'KG', currentStock: 6, minStockAlert: 5, costPerUnit: 45, lastRestocked: yesterday },
  { id: 'ing_12', tenantId: 'tnt_01', name: 'Óleo de Cozinha', unit: 'L', currentStock: 5.5, minStockAlert: 5, costPerUnit: 120, lastRestocked: yesterday },

  // --- CRITICAL (RED) ---
  { id: 'ing_03', tenantId: 'tnt_01', name: 'Tomate', unit: 'KG', currentStock: 2, minStockAlert: 5, costPerUnit: 60, lastRestocked: yesterday }, 
  { id: 'ing_05', tenantId: 'tnt_01', name: 'Coca-Cola Lata', unit: 'UNIT', currentStock: 8, minStockAlert: 20, costPerUnit: 35, lastRestocked: yesterday }, 
  { id: 'ing_10', tenantId: 'tnt_01', name: 'Camarão Tigre', unit: 'KG', currentStock: 1.5, minStockAlert: 2, costPerUnit: 800, lastRestocked: yesterday },
  { id: 'ing_13', tenantId: 'tnt_01', name: 'Alho', unit: 'KG', currentStock: 0.5, minStockAlert: 1, costPerUnit: 200, lastRestocked: yesterday },
];

// 5. PRODUCTS (Menu - Cozinha Moçambicana Completa)
export const products: Product[] = [
  // --- ENTRADAS (cat_01) ---
  { 
    id: 'prod_01', tenantId: 'tnt_01', categoryId: 'cat_01', 
    name: 'Chamuças (Carne/Frango)', 
    description: 'Chamuças crocantes com recheio caseiro bem temperado. (Unidade)', 
    price: 50, isAvailable: true, preparationTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_02', tenantId: 'tnt_01', categoryId: 'cat_01', 
    name: 'Rissóis de Camarão', 
    description: 'Massa leve recheada com camarão cremoso.', 
    price: 60, isAvailable: true, preparationTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_03', tenantId: 'tnt_01', categoryId: 'cat_01', 
    name: 'Badjias (Pastéis de Feijão)', 
    description: 'Bolinhos fritos de feijão nhemba com especiarias (Porção de 4).', 
    price: 100, isAvailable: true, preparationTimeMinutes: 10,
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_04', tenantId: 'tnt_01', categoryId: 'cat_01', 
    name: 'Mandioca Frita', 
    description: 'Mandioca macia por dentro e crocante por fora.', 
    price: 150, isAvailable: true, preparationTimeMinutes: 10,
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-63878707746b?auto=format&fit=crop&q=80&w=300'
  },

  // --- PRATOS TÍPICOS (cat_02) ---
  { 
    id: 'prod_05', tenantId: 'tnt_01', categoryId: 'cat_02', 
    name: 'Matapa com Caranguejo', 
    description: 'Folhas de mandioca piladas, amendoim, leite de coco e caranguejo fresco. Acompanha Xima ou Arroz.', 
    price: 550, isAvailable: true, preparationTimeMinutes: 40,
    imageUrl: 'https://images.unsplash.com/photo-1626509670693-07851d7c4333?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_06', tenantId: 'tnt_01', categoryId: 'cat_02', 
    name: 'Frango à Zambeziana', 
    description: 'Frango marinado e grelhado com molho especial de leite de coco.', 
    price: 650, isAvailable: true, preparationTimeMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_07', tenantId: 'tnt_01', categoryId: 'cat_02', 
    name: 'Galinha à Cafreal', 
    description: 'Galinha grelhada marinada em molho picante à moda antiga. Acompanha batata frita.', 
    price: 600, isAvailable: true, preparationTimeMinutes: 40,
    imageUrl: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_08', tenantId: 'tnt_01', categoryId: 'cat_02', 
    name: 'Mucapata', 
    description: 'Prato tradicional da Zambézia feito com feijão soroco, arroz e coco.', 
    price: 450, isAvailable: false, preparationTimeMinutes: 50,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_09', tenantId: 'tnt_01', categoryId: 'cat_02', 
    name: 'Feijoada Moçambicana', 
    description: 'Feijão manteiga com dobrada, chouriço e carnes variadas.', 
    price: 500, isAvailable: true, preparationTimeMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1551326844-315d1858909b?auto=format&fit=crop&q=80&w=300'
  },

  // --- GRELHADOS & MARISCOS (cat_03) ---
  { 
    id: 'prod_10', tenantId: 'tnt_01', categoryId: 'cat_03', 
    name: 'Camarão Grelhado (500g)', 
    description: 'Camarão tigre grelhado com molho de limão e alho.', 
    price: 1200, isAvailable: true, preparationTimeMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_11', tenantId: 'tnt_01', categoryId: 'cat_03', 
    name: 'Caril de Caranguejo', 
    description: 'Caranguejo cozido em molho rico de caril e coco.', 
    price: 750, isAvailable: true, preparationTimeMinutes: 35,
    imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_12', tenantId: 'tnt_01', categoryId: 'cat_03', 
    name: 'Peixe Vermelho Grelhado', 
    description: 'Peixe fresco grelhado na brasa com legumes cozidos.', 
    price: 800, isAvailable: true, preparationTimeMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a2720?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_13', tenantId: 'tnt_01', categoryId: 'cat_03', 
    name: 'Bife à Portuguesa', 
    description: 'Bife da vazia com molho de natas, ovo a cavalo e batatas às rodelas.', 
    price: 700, isAvailable: true, preparationTimeMinutes: 20,
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=300'
  },

  // --- BEBIDAS (cat_04) ---
  { 
    id: 'prod_14', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Cerveja 2M (Média)', 
    description: 'Cerveja nacional lager, 330ml.', 
    price: 80, isAvailable: true, preparationTimeMinutes: 2,
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_15', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Laurentina Preta', 
    description: 'Cerveja preta premiada, sabor intenso.', 
    price: 90, isAvailable: true, preparationTimeMinutes: 2,
    imageUrl: 'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_16', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Laurentina Clara', 
    description: 'Cerveja clara, leve e refrescante.', 
    price: 80, isAvailable: true, preparationTimeMinutes: 2,
    imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_17', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Manica', 
    description: 'Cerveja tipo Pilsner.', 
    price: 80, isAvailable: true, preparationTimeMinutes: 2,
    imageUrl: 'https://images.unsplash.com/photo-1623819864273-5f750058e178?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_18', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Tip Tinto (Dose)', 
    description: 'Rum tipo R&R nacional.', 
    price: 150, isAvailable: true, preparationTimeMinutes: 3,
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_19', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Sumo Natural (Copo)', 
    description: 'Opções: Manga, Maracujá, Laranja ou Ananás.', 
    price: 120, isAvailable: true, preparationTimeMinutes: 8,
    imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_20', tenantId: 'tnt_01', categoryId: 'cat_04', 
    name: 'Coca-Cola', 
    description: 'Lata 330ml.', 
    price: 60, isAvailable: true, preparationTimeMinutes: 2,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300'
  },

  // --- SOBREMESAS (cat_05) ---
  { 
    id: 'prod_21', tenantId: 'tnt_01', categoryId: 'cat_05', 
    name: 'Mousse de Maracujá', 
    description: 'Sobremesa cremosa feita com polpa fresca.', 
    price: 200, isAvailable: true, preparationTimeMinutes: 5,
    imageUrl: 'https://images.unsplash.com/photo-1543505698-8427513dfd67?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_22', tenantId: 'tnt_01', categoryId: 'cat_05', 
    name: 'Salada de Frutas', 
    description: 'Mamão, Banana, Manga, Maçã e Laranja.', 
    price: 180, isAvailable: true, preparationTimeMinutes: 10,
    imageUrl: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?auto=format&fit=crop&q=80&w=300'
  },
  { 
    id: 'prod_23', tenantId: 'tnt_01', categoryId: 'cat_05', 
    name: 'Bolo de Mandioca', 
    description: 'Fatia de bolo tradicional húmido com coco.', 
    price: 150, isAvailable: true, preparationTimeMinutes: 2,
    imageUrl: 'https://images.unsplash.com/photo-1605291583002-c7f8cb79339e?auto=format&fit=crop&q=80&w=300'
  },
];

// 6. RECIPES (Ficha Técnica)
export const recipes: ProductRecipe[] = [
  { productId: 'prod_05', ingredientId: 'ing_07', quantityRequired: 0.5 }, // Matapa needs lots of leaves
  { productId: 'prod_05', ingredientId: 'ing_08', quantityRequired: 0.2 }, // Peanuts
  { productId: 'prod_05', ingredientId: 'ing_09', quantityRequired: 0.2 }, // Coconut
];

// 7. TABLES
export const tables: Table[] = [
  { id: 'tbl_01', tenantId: 'tnt_01', number: 1, capacity: 4, status: 'OCCUPIED' },
  { id: 'tbl_02', tenantId: 'tnt_01', number: 2, capacity: 2, status: 'AVAILABLE' },
  { id: 'tbl_03', tenantId: 'tnt_01', number: 3, capacity: 6, status: 'RESERVED', reservationName: 'Grupo Aniversário', reservationTime: '2025-02-19T20:00:00Z' },
  { id: 'tbl_04', tenantId: 'tnt_01', number: 4, capacity: 4, status: 'AVAILABLE' },
  { id: 'tbl_05', tenantId: 'tnt_01', number: 5, capacity: 2, status: 'AVAILABLE' },
];

// 8. ORDERS (Histórico e Atuais)
export const orders: Order[] = [
  // Order 1: Completed Dine-in
  {
    id: 'ord_01',
    tenantId: 'tnt_01',
    tableId: 'tbl_01', // This table is currently occupied by this order/similar
    waiterId: 'usr_04',
    type: 'DINE_IN',
    status: 'PREPARING', // Active order on Table 1
    paymentStatus: 'PENDING',
    paymentMethod: 'MPESA',
    totalAmount: 1380,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    customerId: 'Família Santos' // Just to show name in modal
  },
  // Order 2: Active Delivery
  {
    id: 'ord_02',
    tenantId: 'tnt_01',
    customerId: 'cust_01',
    type: 'DELIVERY',
    status: 'PREPARING',
    paymentStatus: 'PENDING',
    paymentMethod: 'CASH',
    totalAmount: 910,
    createdAt: new Date(Date.now() - 1200000).toISOString(), // 20 mins ago
  },
  // Order 3: New Takeaway
  {
    id: 'ord_03',
    tenantId: 'tnt_01',
    type: 'TAKEAWAY',
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    totalAmount: 60,
    createdAt: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
  }
];

// 9. ORDER ITEMS
export const orderItems: OrderItem[] = [
  { id: 'itm_01', orderId: 'ord_01', productId: 'prod_06', quantity: 2, unitPrice: 650, status: 'DONE' }, // 2x Frango Zambeziana
  { id: 'itm_02', orderId: 'ord_01', productId: 'prod_14', quantity: 1, unitPrice: 80, status: 'DONE' }, // 1x 2M
  
  { id: 'itm_03', orderId: 'ord_02', productId: 'prod_05', quantity: 1, unitPrice: 550, status: 'COOKING' }, // 1x Matapa
  { id: 'itm_04', orderId: 'ord_02', productId: 'prod_20', quantity: 1, unitPrice: 60, status: 'DONE' }, // 1x Cola

  { id: 'itm_05', orderId: 'ord_03', productId: 'prod_20', quantity: 1, unitPrice: 60, status: 'QUEUED' },
];

// 10. CUSTOMERS
export const customers: Customer[] = [
  { id: 'cust_01', tenantId: 'tnt_01', name: 'Maria Langa', phone: '841234567', totalOrders: 15, lastOrderDate: now },
  { id: 'cust_02', tenantId: 'tnt_01', name: 'Filipe Muthemba', phone: '829876543', totalOrders: 3 },
];

// 11. EMPLOYEES
export const employees: Employee[] = [
  { id: 'emp_01', tenantId: 'tnt_01', userId: 'usr_04', fullName: 'Pedro Garçom', role: 'WAITER', baseSalary: 8000, commissionRate: 5, hiredDate: '2024-05-10' },
  { id: 'emp_02', tenantId: 'tnt_01', userId: 'usr_03', fullName: 'João Chef', role: 'CHEF', baseSalary: 15000, commissionRate: 0, hiredDate: '2024-02-01' },
];

export const mockDatabase = {
  tenant: currentTenant,
  users,
  categories,
  products,
  ingredients,
  recipes,
  tables,
  orders,
  orderItems,
  customers,
  employees
};