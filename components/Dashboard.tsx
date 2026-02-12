import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDatabase } from '../data/mockData';
import { Product, Order, OrderType, Ingredient, Table, StockUnit, OrderItem, PlanType } from '../types/schema'; // Import types
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area, CartesianGrid, YAxis } from 'recharts';
import { UpgradeModal } from './UpgradeModal';

type Tab = 'overview' | 'orders' | 'tables' | 'menu' | 'inventory';
type StockStatus = 'ok' | 'warning' | 'critical';

// Sales Data
const data = [
  { name: 'Seg', value: 3200 },
  { name: 'Ter', value: 4500 },
  { name: 'Qua', value: 4100 },
  { name: 'Qui', value: 5800 },
  { name: 'Sex', value: 7200 },
  { name: 'Sáb', value: 8500 },
  { name: 'Dom', value: 6900 },
];

// Occupancy Data (Mock)
const occupancyData = [
  { name: 'Seg', value: 45 },
  { name: 'Ter', value: 52 },
  { name: 'Qua', value: 48 },
  { name: 'Qui', value: 65 },
  { name: 'Sex', value: 85 },
  { name: 'Sáb', value: 95 },
  { name: 'Dom', value: 70 },
];

const COLORS = {
  ok: '#10B981',      // Emerald 500
  warning: '#F59E0B', // Amber 500
  critical: '#EF4444' // Red 500
};

// Plan Data for Block Screen
const PLANS_INFO = [
    { id: 'STARTER', name: 'Starter', price: '2.500 MZN', features: ['Até 5 funcionários', 'Dashboard básico', 'Relatórios simples'] },
    { id: 'PRO', name: 'Pro', price: '5.000 MZN', features: ['Funcionários ilimitados', 'Dashboard avançado', 'Delivery', 'Alertas Estoque'], popular: true },
    { id: 'PREMIUM', name: 'Premium', price: '8.000 MZN', features: ['Multi-filial', 'API', 'Suporte 24h', 'Personalização'] },
];

export const Dashboard: React.FC = () => {
  const { user, logout, hasPermission, tenant, updateTenantPlan } = useAuth();
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
        const newMode = !prev;
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        return newMode;
    });
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnavailable, setShowUnavailable] = useState(false);

  // Upgrade Modal State
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    feature: string;
    required: 'PRO' | 'PREMIUM';
  }>({ isOpen: false, feature: '', required: 'PRO' });

  // Data State (Local state to allow updates in the UI demo)
  const [localOrders, setLocalOrders] = useState<Order[]>(mockDatabase.orders);
  const [localIngredients, setLocalIngredients] = useState<Ingredient[]>(mockDatabase.ingredients);
  const [localProducts, setLocalProducts] = useState<Product[]>(mockDatabase.products);
  const [localTables, setLocalTables] = useState<Table[]>(mockDatabase.tables);
  
  // New Order / Edit Order Modal State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null); // Track if we are editing

  // Cart updated to include 'notes' for assigning food to specific people
  const [cart, setCart] = useState<{product: Product, quantity: number, notes: string}[]>([]);
  
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState('');
  
  // Customer & Order Details Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAge, setCustomerAge] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);

  // --- SEARCH & FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // --- ORDER MANAGEMENT STATE (For the Restaurant Owner) ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');

  // --- HISTORY / ITEMS MODAL STATE ---
  const [historyModalData, setHistoryModalData] = useState<{
    order: Order;
    items: {
      quantity: number;
      unitPrice: number;
      productName: string;
      productImage?: string;
      notes?: string;
    }[];
  } | null>(null);

  // --- TABLE DETAILS & RESERVATION STATE ---
  const [viewingTable, setViewingTable] = useState<Table | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    name: '',
    time: ''
  });

  // --- INVENTORY MANAGEMENT STATE ---
  const [isNewIngredientOpen, setIsNewIngredientOpen] = useState(false);
  
  // UPDATE STOCK MODAL STATE
  const [updateStockModal, setUpdateStockModal] = useState<{
    isOpen: boolean;
    item: Ingredient | null;
  }>({ isOpen: false, item: null });
  const [stockToAdd, setStockToAdd] = useState('');

  const [ingForm, setIngForm] = useState({
    name: '',
    unit: 'KG' as StockUnit,
    stock: '',
    minAlert: '',
    cost: ''
  });

  // --- DELETE CONFIRMATION STATE ---
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'PRODUCT' | 'INGREDIENT' | 'ORDER';
    id: string;
    name: string;
  } | null>(null);

  // Notification State
  const [notifications, setNotifications] = useState<Ingredient[]>([]);

  // Mock Data Shortcuts
  const { categories } = mockDatabase;

  // --- TRIAL & DEMO CALCULATIONS ---
  const isDemo = tenant?.isDemo;
  
  const getDaysRemaining = () => {
      if (!tenant?.trialEndsAt) return null;
      const end = new Date(tenant.trialEndsAt).getTime();
      const now = Date.now();
      const diff = end - now;
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };
  
  const daysRemaining = getDaysRemaining();
  // Expired if we have a trial date AND it's less than 0 days
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  // --- COMPUTED PROPERTIES ---
  // Filter orders based on date range
  const filteredOrders = localOrders.filter(order => {
    if (!dateFilter.start && !dateFilter.end) return true;
    
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    
    if (dateFilter.start && orderDate < dateFilter.start) return false;
    if (dateFilter.end && orderDate > dateFilter.end) return false;
    
    return true;
  });

  // Count pending orders for badge
  const pendingOrdersCount = localOrders.filter(o => o.status === 'PENDING').length;

  // --- EFFECT: Check Stock Levels on Mount ---
  useEffect(() => {
    // Only show notifications if user has permission (PRO+)
    if (!hasPermission('PRO')) {
        setNotifications([]);
        return;
    }

    // Check against localIngredients instead of mock data
    const criticalItems = localIngredients.filter(i => i.currentStock <= i.minStockAlert);
    
    if (criticalItems.length > 0) {
      setNotifications(criticalItems);
    } else {
        setNotifications([]);
    }
  }, [localIngredients, tenant?.plan]); // Re-run when plan changes

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const triggerUpgrade = (feature: string, required: 'PRO' | 'PREMIUM' = 'PRO') => {
    setUpgradeModal({ isOpen: true, feature, required });
  };

  const handleChoosePlan = (plan: PlanType) => {
      if (confirm(`Simulando pagamento para o plano ${plan}... \n\nClique OK para confirmar.`)) {
          updateTenantPlan(plan);
          // Force refresh or state update will handle hiding the block screen
      }
  };

  // --- READ-ONLY CHECKER ---
  const checkReadOnly = () => {
      if (isDemo) {
          alert("Modo demonstração: Alterações não são salvas.");
          return true;
      }
      return false;
  };

  // --- HELPERS ---
  const NavItem = ({ tab, icon, label, badgeCount }: { tab: Tab; icon: string; label: string; badgeCount?: number }) => (
    <button
      onClick={() => { 
        setActiveTab(tab); 
        setMobileMenuOpen(false); 
        setSearchQuery(''); // Reset search when changing tabs
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
        activeTab === tab 
          ? 'bg-primary text-white font-semibold shadow-md' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <i className={`fas ${icon} w-6 text-center`}></i>
      <span className="flex-1 text-left">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          {badgeCount}
        </span>
      )}
    </button>
  );

  const getFilteredProducts = () => {
    let filtered = localProducts;
    
    // Availability Filter (Hide unavailable by default unless toggled)
    if (!showUnavailable) {
        filtered = filtered.filter(p => p.isAvailable);
    }

    // Category Filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Inventory Logic
  const getStockStatus = (current: number, min: number): StockStatus => {
    if (current <= min) return 'critical';
    if (current <= min * 1.5) return 'warning';
    return 'ok';
  };

  const inventoryStats = {
    critical: localIngredients.filter(i => getStockStatus(i.currentStock, i.minStockAlert) === 'critical').length,
    warning: localIngredients.filter(i => getStockStatus(i.currentStock, i.minStockAlert) === 'warning').length,
    ok: localIngredients.filter(i => getStockStatus(i.currentStock, i.minStockAlert) === 'ok').length,
  };

  const pieData = [
    { name: 'Estoque OK', value: inventoryStats.ok, color: COLORS.ok },
    { name: 'Em Alerta', value: inventoryStats.warning, color: COLORS.warning },
    { name: 'Crítico', value: inventoryStats.critical, color: COLORS.critical },
  ].filter(d => d.value > 0);

  // --- CART FUNCTIONS ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const updateItemNote = (productId: string, note: string) => {
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, notes: note } : item
    ));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // --- ORDER CREATION & EDIT (Frontend) ---
  const handleEditOrder = (order: Order) => {
    if (checkReadOnly()) return;
    
    // 1. Find Items for this order
    const items = mockDatabase.orderItems.filter(i => i.orderId === order.id);
    
    // 2. Map items to Cart structure
    const mappedCart = items.map(item => {
        const product = localProducts.find(p => p.id === item.productId);
        if (!product) return null;
        return {
            product,
            quantity: item.quantity,
            notes: item.notes || ''
        };
    }).filter(i => i !== null) as {product: Product, quantity: number, notes: string}[];

    setCart(mappedCart);

    // 3. Fill Form Data
    setOrderType(order.type);
    
    if (order.type === 'DINE_IN' && order.tableId) {
        setSelectedTable(order.tableId);
        // Try to estimate guests if not stored
        setNumberOfGuests(1); 
    } else {
        setSelectedTable('');
    }

    if (order.customerId) {
        // If customerId matches a name in our logic (for demo)
        setCustomerName(order.customerId); 
    }

    setEditingOrder(order);
    setIsNewOrderOpen(true);
  };

  const handleCreateOrder = () => {
    if (checkReadOnly()) return;

    if (cart.length === 0) return;
    
    // Validation
    if (orderType === 'DINE_IN' && !selectedTable) {
        alert("Por favor, selecione uma mesa.");
        return;
    }
    if (orderType === 'DELIVERY') {
        // Double check permission for safety, though UI should prevent it
        if (!hasPermission('PRO')) {
            triggerUpgrade('Delivery');
            return;
        }

        if (!customerName || !customerAddress || !customerPhone) {
            alert("Para delivery, preencha Nome, Telefone e Endereço.");
            return;
        }
    }

    // --- UPDATE EXISTING ORDER ---
    if (editingOrder) {
        const updatedOrder: Order = {
            ...editingOrder,
            type: orderType,
            totalAmount: cartTotal,
            tableId: orderType === 'DINE_IN' ? selectedTable : undefined,
            customerId: customerName ? customerName : undefined
        };

        // Update Local State
        setLocalOrders(prev => prev.map(o => o.id === editingOrder.id ? updatedOrder : o));

        // Update Mock DB Orders (find and replace)
        const orderIdx = mockDatabase.orders.findIndex(o => o.id === editingOrder.id);
        if (orderIdx >= 0) mockDatabase.orders[orderIdx] = updatedOrder;

        // Update Mock DB Items: Remove old items, add new ones
        // 1. Remove old
        const keptItems = mockDatabase.orderItems.filter(i => i.orderId !== editingOrder.id);
        mockDatabase.orderItems.length = 0; // Clear array
        mockDatabase.orderItems.push(...keptItems); // Restore others

        // 2. Add new
        const newItems: OrderItem[] = cart.map((item, index) => ({
            id: `itm_${Date.now()}_${index}`,
            orderId: editingOrder.id,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            notes: item.notes,
            status: 'QUEUED' // Reset status on edit
        }));
        newItems.forEach(item => mockDatabase.orderItems.push(item));

        alert("Pedido atualizado com sucesso!");
    } 
    // --- CREATE NEW ORDER ---
    else {
        const orderId = `ord_${Date.now()}`;
        const newOrder: Order = {
            id: orderId,
            tenantId: mockDatabase.tenant.id,
            type: orderType,
            status: 'PENDING', // Start as pending for owner approval
            paymentStatus: 'PENDING',
            totalAmount: cartTotal,
            createdAt: new Date().toISOString(),
            tableId: orderType === 'DINE_IN' ? selectedTable : undefined,
            customerId: customerName ? customerName : undefined // Storing name temporarily in ID field for demo
        };

        // Create OrderItems to persist history
        const newOrderItems: OrderItem[] = cart.map((item, index) => ({
            id: `itm_${Date.now()}_${index}`,
            orderId: orderId,
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            notes: item.notes,
            status: 'QUEUED'
        }));

        // Save to mock database so History works for new orders
        mockDatabase.orders.unshift(newOrder);
        newOrderItems.forEach(item => mockDatabase.orderItems.push(item));

        setLocalOrders([newOrder, ...localOrders]);
        alert("Pedido enviado com sucesso! Aguarde a confirmação do restaurante.");
    }

    setIsNewOrderOpen(false);
    
    // Reset Form
    resetModal();
    
    // Navigate to orders
    setActiveTab('orders'); 
  };

  // --- ORDER MANAGEMENT (Owner Side) ---
  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEstimatedTime(''); // Reset time when opening
  };

  const handleOpenHistory = (order: Order) => {
    // Find items belonging to this order
    const orderItems = mockDatabase.orderItems.filter(item => item.orderId === order.id);
    
    // Map to include product details
    const itemsWithDetails = orderItems.map(item => {
      const product = mockDatabase.products.find(p => p.id === item.productId);
      return {
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        productName: product ? product.name : 'Produto Removido',
        productImage: product?.imageUrl,
        notes: item.notes
      };
    });

    setHistoryModalData({
      order,
      items: itemsWithDetails
    });
  };

  const handleAcceptOrder = () => {
    if (checkReadOnly()) return;
    if (!selectedOrder) return;
    if (!estimatedTime) {
      alert("Por favor, informe uma estimativa de tempo para o cliente.");
      return;
    }

    setLocalOrders(prev => prev.map(o => 
      o.id === selectedOrder.id ? { ...o, status: 'PREPARING' } : o
    ));

    const message = `Pedido #${selectedOrder.id.slice(-4)} ACEITO!\n\n` +
                    `Tipo: ${selectedOrder.type}\n` +
                    `Previsão: ${estimatedTime}\n` +
                    `Mensagem enviada ao cliente: "Estamos preparando seu pedido. Ficará pronto em ${estimatedTime}."`;
    
    alert(message);
    setSelectedOrder(null);
  };

  const handleRejectOrder = () => {
    if (checkReadOnly()) return;
    if (!selectedOrder) return;
    if (confirm("Tem certeza que deseja rejeitar este pedido?")) {
        setLocalOrders(prev => prev.map(o => 
            o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o
        ));
        setSelectedOrder(null);
    }
  };

  // --- DELETE MANAGEMENT ---
  const promptDelete = (type: 'PRODUCT' | 'INGREDIENT' | 'ORDER', id: string, name: string) => {
    if (checkReadOnly()) return;
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      name
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirmation) return;
    // Check again just in case
    if (checkReadOnly()) {
        setDeleteConfirmation(null);
        return;
    }

    if (deleteConfirmation.type === 'INGREDIENT') {
      // Remove from Mock Database
      const index = mockDatabase.ingredients.findIndex(i => i.id === deleteConfirmation.id);
      if (index > -1) mockDatabase.ingredients.splice(index, 1);
      
      // Update Local State
      setLocalIngredients(prev => prev.filter(i => i.id !== deleteConfirmation.id));
    } else if (deleteConfirmation.type === 'PRODUCT') {
      // Remove from Mock Database
      const index = mockDatabase.products.findIndex(p => p.id === deleteConfirmation.id);
      if (index > -1) mockDatabase.products.splice(index, 1);

      // Update Local State
      setLocalProducts(prev => prev.filter(p => p.id !== deleteConfirmation.id));
    } else if (deleteConfirmation.type === 'ORDER') {
      // Remove from Mock Database
      const index = mockDatabase.orders.findIndex(o => o.id === deleteConfirmation.id);
      if (index > -1) mockDatabase.orders.splice(index, 1);

      // Clean up OrderItems
      const keptItems = mockDatabase.orderItems.filter(i => i.orderId !== deleteConfirmation.id);
      mockDatabase.orderItems.length = 0;
      mockDatabase.orderItems.push(...keptItems);

      // Update Local State
      setLocalOrders(prev => prev.filter(o => o.id !== deleteConfirmation.id));
    }

    setDeleteConfirmation(null);
  };

  // --- TABLE DETAILS HANDLER ---
  const handleTableClick = (table: Table) => {
    setViewingTable(table);
    setIsReserving(false);
    setReservationForm({ name: '', time: '' });
  };

  const handleReserveTable = () => {
    if (checkReadOnly()) return;
    if (!viewingTable) return;
    if (!reservationForm.name || !reservationForm.time) {
      alert("Por favor, preencha o nome e o horário da reserva.");
      return;
    }

    // Update local table state
    const updatedTable: Table = {
      ...viewingTable,
      status: 'RESERVED',
      reservationName: reservationForm.name,
      reservationTime: reservationForm.time
    };

    setLocalTables(prev => prev.map(t => t.id === viewingTable.id ? updatedTable : t));
    
    // Update current viewing table to show new status immediately
    setViewingTable(updatedTable);
    setIsReserving(false);
    
    alert(`Mesa ${viewingTable.number} reservada com sucesso para ${reservationForm.name}!`);
  };

  const handleCancelReservation = () => {
    if (checkReadOnly()) return;
    if (!viewingTable) return;
    if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

    // Reset table to AVAILABLE
    const updatedTable: Table = {
      ...viewingTable,
      status: 'AVAILABLE',
      reservationName: undefined,
      reservationTime: undefined
    };

    setLocalTables(prev => prev.map(t => t.id === viewingTable.id ? updatedTable : t));
    setViewingTable(updatedTable);
  };

  // --- INVENTORY MANAGEMENT HANDLERS ---
  
  // 1. ADD NEW INGREDIENT
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnly()) return;

    // Validation
    const stockVal = parseFloat(ingForm.stock);
    const minVal = parseFloat(ingForm.minAlert);
    const costVal = parseFloat(ingForm.cost);

    if (!ingForm.name || isNaN(stockVal) || isNaN(minVal) || isNaN(costVal)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    if (stockVal < 0 || minVal < 0 || costVal < 0) {
        alert("Valores não podem ser negativos.");
        return;
    }

    const newIng: Ingredient = {
      id: `ing_${Date.now()}`,
      tenantId: mockDatabase.tenant.id,
      name: ingForm.name,
      unit: ingForm.unit,
      currentStock: stockVal,
      minStockAlert: minVal,
      costPerUnit: costVal,
      lastRestocked: new Date().toISOString(),
    };

    // Save to mock database so it persists in the session "backend"
    mockDatabase.ingredients.push(newIng);

    setLocalIngredients(prev => [...prev, newIng]);
    setIsNewIngredientOpen(false);
    
    // Reset form
    setIngForm({
      name: '',
      unit: 'KG',
      stock: '',
      minAlert: '',
      cost: ''
    });
    
    alert(`Insumo "${newIng.name}" cadastrado com sucesso!`);
  };

  // 2. OPEN UPDATE STOCK MODAL
  const openUpdateStockModal = (item: Ingredient) => {
    setUpdateStockModal({
        isOpen: true,
        item: item
    });
    setStockToAdd('');
  };

  // 3. SAVE STOCK UPDATE
  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkReadOnly()) return;
    
    const { item } = updateStockModal;
    if (!item) return;

    const qtyToAdd = parseFloat(stockToAdd);

    // Validation
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
        alert("Por favor, insira uma quantidade válida maior que zero.");
        return;
    }

    // Calculate new stock
    const newStock = item.currentStock + qtyToAdd;

    // Update in Local State
    const updatedItem = { ...item, currentStock: newStock, lastRestocked: new Date().toISOString() };
    setLocalIngredients(prev => prev.map(i => i.id === item.id ? updatedItem : i));

    // Update in Mock Database
    const index = mockDatabase.ingredients.findIndex(i => i.id === item.id);
    if (index > -1) {
        mockDatabase.ingredients[index] = updatedItem;
    }

    // Close Modal & Reset
    setUpdateStockModal({ isOpen: false, item: null });
    setStockToAdd('');
    
    // Feedback
    // In a real app this would be a toast, here alert or console log
  };

  // --- EXPORT TO CSV HANDLER ---
  const handleExport = () => {
    // Check Permission: Export is PRO+
    if (!hasPermission('PRO')) {
        triggerUpgrade('Exportação CSV', 'PRO');
        return;
    }

    let dataToExport: any[] = [];
    let filename = '';

    if (activeTab === 'orders') {
      filename = 'restroflow_pedidos.csv';
      // Use filteredOrders instead of localOrders for export
      dataToExport = filteredOrders.map(o => ({
         ID: o.id,
         Tipo: o.type,
         Status: o.status,
         'Mesa/Cliente': o.tableId ? `Mesa ${localTables.find(t => t.id === o.tableId)?.number || '?'}` : (o.customerId || 'N/A'),
         Total: o.totalAmount,
         Data: new Date(o.createdAt).toLocaleString('pt-BR')
      }));
    } else if (activeTab === 'menu') {
      filename = 'restroflow_cardapio.csv';
      dataToExport = localProducts.map(p => ({
         Nome: p.name,
         Categoria: categories.find(c => c.id === p.categoryId)?.name || 'N/A',
         Preco: p.price,
         Disponivel: p.isAvailable ? 'Sim' : 'Não',
         Tempo_Preparo_Min: p.preparationTimeMinutes
      }));
    } else if (activeTab === 'inventory') {
      filename = 'restroflow_estoque.csv';
      dataToExport = localIngredients.map(i => ({
         Item: i.name,
         Estoque_Atual: i.currentStock,
         Unidade: i.unit,
         Estoque_Minimo: i.minStockAlert,
         Custo_Unitario: i.costPerUnit,
         Status: getStockStatus(i.currentStock, i.minStockAlert) === 'ok' ? 'Normal' : 'Baixo/Crítico'
      }));
    } else {
      return; 
    }

    if (dataToExport.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    // Convert to CSV string
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => 
      Object.values(obj).map(val => {
        const stringVal = String(val);
        // Escape quotes and wrap in quotes if contains comma
        if (stringVal.includes(',') || stringVal.includes('"')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      }).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- HEADER ACTION HANDLER ---
  const handleHeaderAction = () => {
    if (activeTab === 'inventory') {
      setIsNewIngredientOpen(true);
    } else if (activeTab === 'menu') {
      // Placeholder for menu item creation
      alert("Funcionalidade de Novo Item de Menu em desenvolvimento.");
    } else {
      // Default to Order Modal for Overview, Orders, Tables
      resetModal();
    }
  };

  const handleDescriptionChange = (productId: string, newDescription: string) => {
    setLocalProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, description: newDescription } : p
      )
    );
  };

  const resetModal = () => {
    setCart([]);
    setIsNewOrderOpen(true);
    setEditingOrder(null); // Clear editing state
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAge('');
    setCustomerAddress('');
    setNumberOfGuests(1);
    setSelectedTable('');
    // Default to Dine In when opening
    setOrderType('DINE_IN');
  };

  // --- BLOCKED SCREEN FOR EXPIRED TRIAL ---
  if (isExpired) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-[fade-in_0.5s_ease-out] relative">
                  {/* Decorative Header */}
                  <div className="bg-gradient-to-r from-red-500 to-pink-600 h-40 flex flex-col items-center justify-center text-white relative">
                       <button onClick={logout} className="absolute top-4 right-4 text-white/80 hover:text-white flex items-center gap-2">
                           <i className="fas fa-sign-out-alt"></i> Sair
                       </button>
                       <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3">
                           <i className="fas fa-lock text-3xl"></i>
                       </div>
                       <h2 className="text-3xl font-bold">Período de Teste Finalizado</h2>
                       <p className="opacity-90">Faça um upgrade para continuar usando o RestroFlow</p>
                  </div>

                  <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {PLANS_INFO.map(plan => (
                              <div key={plan.id} className={`border rounded-2xl p-6 flex flex-col ${plan.popular ? 'border-primary shadow-lg relative' : 'border-gray-200'}`}>
                                  {plan.popular && (
                                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Recomendado</span>
                                  )}
                                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{plan.name}</h3>
                                  <p className="text-2xl font-extrabold text-center text-gray-800 mb-6">{plan.price}<span className="text-xs font-normal text-gray-500">/mês</span></p>
                                  
                                  <ul className="space-y-3 mb-8 flex-1">
                                      {plan.features.map((f, i) => (
                                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                              <i className="fas fa-check text-green-500"></i> {f}
                                          </li>
                                      ))}
                                  </ul>
                                  
                                  <button 
                                      onClick={() => handleChoosePlan(plan.id as PlanType)}
                                      className={`w-full py-2 rounded-lg font-bold transition-all ${plan.popular ? 'bg-primary text-white hover:bg-primary-light' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                  >
                                      Escolher {plan.name}
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- CHART COLORS (Dynamic) ---
  const chartAxisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const chartTooltipStyle = {
    borderRadius: '8px', 
    border: 'none', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
    color: isDarkMode ? '#F9FAFB' : '#1F2937'
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans transition-colors duration-200">
      
      {/* --- TOP BANNERS --- */}
      {isDemo && (
          <div className="bg-blue-600 text-white text-center py-2 text-sm font-medium relative z-50 shadow-md">
              <i className="fas fa-info-circle mr-2"></i> Você está em <strong>Modo Demonstração</strong>. Alterações não serão salvas.
          </div>
      )}
      {!isDemo && daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
          <div className={`text-white text-center py-2 text-sm font-medium relative z-50 shadow-md
            ${daysRemaining <= 3 ? 'bg-accent' : 'bg-emerald-600'}
          `}>
              <i className="fas fa-clock mr-2"></i> Seu teste grátis termina em <strong>{daysRemaining} dias</strong>. <button onClick={() => triggerUpgrade('Plano Completo', 'PRO')} className="underline hover:text-gray-100 ml-1">Fazer upgrade agora.</button>
          </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <UpgradeModal 
            isOpen={upgradeModal.isOpen} 
            onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })} 
            featureName={upgradeModal.feature}
            requiredPlan={upgradeModal.required}
        />

        {/* Notification Toasts - Only PRO+ */}
        {hasPermission('PRO') && (
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-80 pointer-events-none mt-12 lg:mt-0">
                {notifications.map((item) => (
                <div 
                    key={item.id} 
                    className="pointer-events-auto bg-white dark:bg-gray-800 border-l-4 border-red-500 shadow-xl rounded-r-lg p-4 animate-[slide-in-right_0.3s_ease-out] flex items-start gap-3"
                >
                    <div className="text-red-500 text-xl mt-0.5">
                    <i className="fas fa-exclamation-circle animate-pulse"></i>
                    </div>
                    <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Estoque Crítico!</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        O item <strong>{item.name}</strong> está com apenas <strong>{item.currentStock} {item.unit}</strong>.
                    </p>
                    <p className="text-xs text-red-600 font-semibold mt-1">Reposição imediata necessária.</p>
                    </div>
                    <button 
                    onClick={() => removeNotification(item.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                    <i className="fas fa-times"></i>
                    </button>
                </div>
                ))}
            </div>
        )}

        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-theme(spacing.8))] fixed left-0 top-auto z-20 transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 font-display font-extrabold text-2xl text-primary">
                <i className="fas fa-fire text-accent"></i> RestroFlow
            </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem tab="overview" icon="fa-chart-pie" label="Visão Geral" />
            <NavItem tab="orders" icon="fa-clipboard-list" label="Pedidos" badgeCount={pendingOrdersCount} />
            <NavItem tab="tables" icon="fa-chair" label="Mesas" />
            <NavItem tab="menu" icon="fa-utensils" label="Cardápio" />
            <NavItem tab="inventory" icon="fa-boxes" label="Estoque" />
            
            {/* Multi-branch Link - PREMIUM Only (Visual Lock) */}
            <button
                onClick={() => {
                    if(!hasPermission('PREMIUM')) triggerUpgrade('Multi-filial', 'PREMIUM');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 group`}
            >
                <i className={`fas fa-building w-6 text-center`}></i>
                <span className="flex-1 text-left">Filiais</span>
                {!hasPermission('PREMIUM') && <i className="fas fa-lock text-xs text-gray-400"></i>}
            </button>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <img 
                src={user?.avatarUrl} 
                alt={user?.name} 
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
                />
                <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white
                        ${tenant?.plan === 'PREMIUM' ? 'bg-purple-500' : tenant?.plan === 'PRO' ? 'bg-blue-500' : 'bg-gray-500'}
                    `}>
                        {tenant?.plan}
                    </span>
                    {isDemo && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-orange-500">DEMO</span>}
                </div>
                </div>
            </div>
            
            {/* Plan Switcher for Demo Purposes */}
            <div className="mb-4">
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Simular Plano:</p>
                <div className="flex gap-1">
                    {(['STARTER', 'PRO', 'PREMIUM'] as PlanType[]).map(p => (
                        <button 
                            key={p}
                            onClick={() => updateTenantPlan(p)}
                            className={`flex-1 text-[10px] py-1 border rounded ${tenant?.plan === p ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'}`}
                        >
                            {p.charAt(0)}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 dark:text-red-400 dark:border-red-900/30 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-semibold"
            >
                <i className="fas fa-sign-out-alt"></i> Sair
            </button>
            </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 w-full bg-white dark:bg-gray-800 z-20 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between mt-8 md:mt-0">
            <div className="flex items-center gap-2 font-display font-extrabold text-xl text-primary">
            <i className="fas fa-fire text-accent"></i> RestroFlow
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                 <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 dark:text-gray-300">
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
              </button>
            </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-10 bg-white dark:bg-gray-800 pt-24 px-6 pb-6 animate-fade-in-down flex flex-col">
            <nav className="flex-1 space-y-2">
                <NavItem tab="overview" icon="fa-chart-pie" label="Visão Geral" />
                <NavItem tab="orders" icon="fa-clipboard-list" label="Pedidos" badgeCount={pendingOrdersCount} />
                <NavItem tab="tables" icon="fa-chair" label="Mesas" />
                <NavItem tab="menu" icon="fa-utensils" label="Cardápio" />
                <NavItem tab="inventory" icon="fa-boxes" label="Estoque" />
            </nav>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
                <button onClick={logout} className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold">
                Sair do Sistema
                </button>
            </div>
            </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-6 pt-24 lg:pt-6 overflow-y-auto">
            <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {activeTab === 'overview' ? 'Visão Geral' : activeTab === 'menu' ? 'Cardápio Digital' : activeTab === 'inventory' ? 'Gestão de Estoque' : activeTab}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
            <div className="hidden lg:flex gap-3">
                {/* Theme Toggle Desktop */}
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                >
                    <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>

                {['orders', 'menu', 'inventory'].includes(activeTab) && (
                <button 
                    onClick={handleExport}
                    className={`border px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2
                        ${hasPermission('PRO') 
                            ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700' 
                            : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'}`}
                >
                    {!hasPermission('PRO') && <i className="fas fa-lock text-xs"></i>}
                    <i className="fas fa-file-export"></i> Exportar CSV
                </button>
                )}
                <button 
                onClick={handleHeaderAction}
                className="bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-primary-light transition-colors flex items-center gap-2"
                >
                <i className="fas fa-plus"></i> {activeTab === 'inventory' ? 'Novo Insumo' : activeTab === 'menu' ? 'Novo Item' : 'Novo Pedido'}
                </button>
            </div>
            </header>

            {/* --- VIEW: OVERVIEW --- */}
            {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                        <i className="fas fa-dollar-sign text-xl"></i>
                    </div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">+12%</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Vendas Hoje</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">32.450 MZN</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <i className="fas fa-receipt text-xl"></i>
                    </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Pedidos Abertos</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{localOrders.filter(o => o.status !== 'DELIVERED').length}</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                        <i className="fas fa-chair text-xl"></i>
                    </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Ocupação Mesas</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45%</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden transition-colors">
                    <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                        <i className="fas fa-exclamation-triangle text-xl"></i>
                    </div>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Ação</span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Estoque Baixo</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{hasPermission('PRO') ? inventoryStats.critical + ' Itens' : '???'}</h3>
                    
                    {/* Overlay for Starter Plan on Inventory Widget */}
                    {!hasPermission('PRO') && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/90 backdrop-blur-[1px] flex items-center justify-center flex-col text-center p-2 cursor-pointer transition-colors"
                            onClick={() => triggerUpgrade('Alertas de Estoque', 'PRO')}>
                            <i className="fas fa-lock text-gray-400 text-xl mb-1"></i>
                            <span className="text-xs font-bold text-gray-500">Upgrade para ver</span>
                        </div>
                    )}
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">Desempenho de Vendas (Semana)</h3>
                    <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                        {/* @ts-ignore */}
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                            <BarChart data={data}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: chartAxisColor, fontSize: 12 }} 
                                dy={10}
                            />
                            <Tooltip 
                                cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                contentStyle={chartTooltipStyle}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                                ))}
                            </Bar>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0F766E" stopOpacity={1}/>
                                <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">Ocupação Semanal (%)</h3>
                    <div className="h-64 w-full" style={{ minHeight: '250px' }}>
                        {/* @ts-ignore */}
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                            <AreaChart data={occupancyData}>
                            <defs>
                                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#E5E7EB"} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: chartAxisColor, fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                hide={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: chartAxisColor, fontSize: 10 }}
                                unit="%"
                            />
                            <Tooltip 
                                contentStyle={chartTooltipStyle}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#F97316" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorOccupancy)" 
                            />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                </div>

                {/* List and Tables Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Orders (Side List) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col transition-colors">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Em Andamento</h3>
                    <div className="space-y-4 flex-1">
                    {localOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0">
                        <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">#{order.id.slice(-4)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{order.type} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-full 
                            ${order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                            {order.status === 'PREPARING' ? 'Prep' : 'Pend'}
                        </div>
                        </div>
                    ))}
                    {localOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">Nenhum pedido ativo.</p>
                    )}
                    </div>
                    <button 
                    onClick={() => setActiveTab('orders')}
                    className="w-full mt-4 py-2 text-sm text-primary font-bold hover:bg-primary/5 dark:hover:bg-primary/20 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                    >
                    Ver todos <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </div>

                {/* History Table (Main Content) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Histórico de Vendas (Últimos 10)</h3>
                    </div>
                    <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">Pedido</th>
                            <th className="p-4">Data/Hora</th>
                            <th className="p-4">Tipo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Valor</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {localOrders.slice(0, 10).map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="p-4 font-mono font-bold text-gray-600 dark:text-gray-300">#{order.id.slice(-4)}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-4">
                                <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 text-xs">
                                <i className={`fas ${order.type === 'DINE_IN' ? 'fa-utensils' : order.type === 'DELIVERY' ? 'fa-motorcycle' : 'fa-shopping-bag'} text-gray-400`}></i>
                                {order.type === 'DINE_IN' ? 'Salão' : order.type === 'DELIVERY' ? 'Delivery' : 'Balcão'}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                                order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                }`}>
                                {order.status === 'DELIVERED' ? 'Ok' : order.status}
                                </span>
                            </td>
                            <td className="p-4 text-right font-bold text-gray-900 dark:text-white">{order.totalAmount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>

            </div>
            )}
            
            {/* ... other tabs would be here but omitted for brevity in this specific update as main logic is covered ... */}
            {/* Re-injecting content from previous version for consistency */}

            {/* --- VIEW: ORDERS --- */}
            {activeTab === 'orders' && (
            <div className="space-y-4">
                {/* Date Filter Controls */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap items-end gap-4 transition-colors">
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Data Inicial</label>
                    <input 
                    type="date" 
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Data Final</label>
                    <input 
                    type="date" 
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                {(dateFilter.start || dateFilter.end) && (
                    <button 
                    onClick={() => setDateFilter({ start: '', end: '' })}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors h-[38px]"
                    >
                    Limpar
                    </button>
                )}
                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400 self-center">
                    Mostrando {filteredOrders.length} pedidos
                </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">ID</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Tipo</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Mesa/Cliente</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Status</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Total</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-sm text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredOrders.length === 0 ? (
                            <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                Nenhum pedido encontrado para o período selecionado.
                            </td>
                            </tr>
                        ) : (
                        filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="p-4 font-mono text-sm text-gray-500 dark:text-gray-400">#{order.id.slice(-4)}</td>
                            <td className="p-4">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <i className={`fas ${order.type === 'DINE_IN' ? 'fa-utensils' : order.type === 'DELIVERY' ? 'fa-motorcycle' : 'fa-shopping-bag'} text-gray-400`}></i>
                                {order.type === 'DINE_IN' ? 'Salão' : order.type === 'DELIVERY' ? 'Delivery' : 'Balcão'}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                {order.tableId ? `Mesa ${localTables.find(t => t.id === order.tableId)?.number}` : (order.customerId || 'Cliente Externo')}
                            </td>
                            <td className="p-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide
                                ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                                {order.status}
                                </span>
                            </td>
                            <td className="p-4 font-bold text-gray-900 dark:text-white text-sm">
                                {order.totalAmount} MZN
                            </td>
                            <td className="p-4 flex gap-2 justify-center">
                                <button 
                                onClick={() => handleOpenOrderDetails(order)}
                                className="text-primary hover:text-primary-light font-medium text-sm border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                                >
                                Detalhes
                                </button>
                                <button 
                                onClick={() => handleOpenHistory(order)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-sm border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                                title="Ver Itens do Pedido"
                                >
                                <i className="fas fa-list-ul"></i>
                                </button>
                                
                                {order.status === 'PENDING' && (
                                    <>
                                        <button 
                                        onClick={() => handleEditOrder(order)}
                                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm border border-blue-200 dark:border-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1"
                                        title="Editar Pedido"
                                        >
                                        <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button 
                                        onClick={() => promptDelete('ORDER', order.id, `Pedido #${order.id.slice(-4)}`)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm border border-red-200 dark:border-red-800 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                                        title="Excluir Pedido"
                                        >
                                        <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </>
                                )}
                            </td>
                            </tr>
                        ))
                        )}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            )}

            {/* --- VIEW: TABLES --- */}
            {activeTab === 'tables' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {localTables.map(table => (
                <div 
                    key={table.id} 
                    onClick={() => handleTableClick(table)}
                    className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1
                    ${table.status === 'AVAILABLE' ? 'border-green-100 bg-green-50/50 dark:border-green-900 dark:bg-green-900/20' : 
                    table.status === 'OCCUPIED' ? 'border-red-100 bg-red-50/50 dark:border-red-900 dark:bg-red-900/20' : 'border-yellow-100 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-900/20'}`}
                >
                    <div className="relative">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-sm
                        ${table.status === 'AVAILABLE' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 
                        table.status === 'OCCUPIED' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'}`}>
                        {table.number}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-800
                        ${table.status === 'AVAILABLE' ? 'bg-green-500 text-white' : 
                        table.status === 'OCCUPIED' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>
                        <i className="fas fa-chair"></i>
                    </div>
                    </div>
                    <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">{table.status === 'AVAILABLE' ? 'Livre' : table.status === 'OCCUPIED' ? 'Ocupada' : 'Reservada'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{table.capacity} lugares</p>
                    </div>
                </div>
                ))}
            </div>
            )}

            {/* --- VIEW: MENU --- */}
            {activeTab === 'menu' && (
            <div className="space-y-6">
                {/* Search Bar & Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <i className="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
                        <input 
                            type="text" 
                            placeholder="Buscar item do cardápio..." 
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowUnavailable(!showUnavailable)}
                        className={`px-4 py-3 rounded-xl border font-semibold text-sm whitespace-nowrap transition-colors flex items-center gap-2 shadow-sm
                        ${showUnavailable 
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'}`}
                    >
                        <i className={`fas ${showUnavailable ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        {showUnavailable ? 'Ocultar Indisponíveis' : 'Ver Indisponíveis'}
                    </button>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all
                    ${selectedCategory === 'all' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2
                        ${selectedCategory === cat.id 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                    >
                    <i className={`fas ${cat.icon}`}></i>
                    {cat.name}
                    </button>
                ))}
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredProducts().map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                    <div className="h-40 w-full bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                        {product.imageUrl ? (
                        <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-4xl">
                            <i className="fas fa-utensils"></i>
                        </div>
                        )}
                        {!product.isAvailable && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">
                            Indisponível
                            </span>
                        </div>
                        )}
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title={product.name}>{product.name}</h3>
                        <span className="font-bold text-primary">{product.price} MZN</span>
                        </div>
                        
                        {product.name === 'Chamuças (Carne/Frango)' ? (
                        <div className="mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Descrição do Item</label>
                            <textarea 
                            className="w-full text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none resize-none"
                            rows={2}
                            value={product.description}
                            onChange={(e) => handleDescriptionChange(product.id, e.target.value)}
                            />
                        </div>
                        ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4 line-clamp-2 h-8">
                            {product.description}
                        </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 dark:border-gray-700 pt-3">
                        <span className="flex items-center gap-1">
                            <i className="far fa-clock"></i> {product.preparationTimeMinutes} min
                        </span>
                        <div className="flex gap-3">
                            <button className="text-primary font-bold hover:underline">
                            Editar
                            </button>
                            <button 
                            onClick={() => promptDelete('PRODUCT', product.id, product.name)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Excluir item"
                            >
                            <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
            
            {/* --- VIEW: INVENTORY --- */}
            {activeTab === 'inventory' && (
            <div className="space-y-6">
                {/* Stock Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Green / OK */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-emerald-500 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Estoque OK</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{inventoryStats.ok}</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Nenhum risco de falta</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xl">
                    <i className="fas fa-check"></i>
                    </div>
                </div>

                {/* Yellow / Warning */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-amber-500 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Em Alerta</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{inventoryStats.warning}</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Repor em breve</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xl">
                    <i className="fas fa-exclamation"></i>
                    </div>
                </div>

                {/* Red / Critical */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 border-red-500 shadow-sm flex items-center justify-between transition-colors">
                    <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Crítico</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{inventoryStats.critical}</h3>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Falta iminente!</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xl">
                    <i className="fas fa-times"></i>
                    </div>
                </div>
                </div>

                {/* Inventory Chart & List */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 w-full text-left">Saúde do Estoque</h3>
                    <div className="h-64 w-full relative">
                    {/* @ts-ignore */}
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                        <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-gray-800 dark:text-white">{localIngredients.length}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Itens Totais</span>
                    </div>
                    </div>
                </div>

                {/* Inventory List */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col transition-colors">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lista de Insumos</h3>
                    {/* Search Input for Inventory */}
                    <div className="relative w-64">
                        <i className="fas fa-search absolute left-3 top-2.5 text-gray-400 text-xs"></i>
                        <input 
                        type="text" 
                        placeholder="Filtrar insumo..." 
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="p-4">Item</th>
                            <th className="p-4">Nível de Estoque</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Ação</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {localIngredients
                            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(item => {
                            const status = getStockStatus(item.currentStock, item.minStockAlert);
                            // Calculate percentage capped at 100% for progress bar (relative to 2x min stock for visualization)
                            const maxRef = item.minStockAlert * 3; 
                            const percentage = Math.min((item.currentStock / maxRef) * 100, 100);
                            
                            return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="p-4">
                                <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Mín: {item.minStockAlert} {item.unit}</div>
                                </td>
                                <td className="p-4 w-1/3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.currentStock} {item.unit}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        status === 'ok' ? 'bg-emerald-500' : 
                                        status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                </td>
                                <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                    status === 'ok' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 
                                    status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                    {status === 'ok' ? 'Normal' : status === 'warning' ? 'Baixo' : 'Crítico'}
                                </span>
                                </td>
                                <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => openUpdateStockModal(item)}
                                        className="text-primary hover:bg-primary/10 dark:hover:bg-primary/20 p-2 rounded-lg transition-colors"
                                        title="Atualizar Estoque"
                                    >
                                    <i className="fas fa-plus"></i>
                                    </button>
                                    <button 
                                    onClick={() => promptDelete('INGREDIENT', item.id, item.name)}
                                    className="text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                    >
                                    <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
            </div>
            )}

        </main>

      {/* --- NEW ORDER MODAL, ORDER DETAILS, ETC (OMITTED FOR BREVITY AS LOGIC IS UNCHANGED BUT RENDERED INSIDE MAIN FLOW) --- */}
      {/* Re-injecting modals to ensure they work */}
      
      {/* --- NEW ORDER MODAL --- */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsNewOrderOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-[fade-in_0.2s_ease-out] transition-colors">
            
            {/* Left: Product Catalog */}
            <div className="w-full md:w-3/5 lg:w-2/3 bg-gray-50 dark:bg-gray-900 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Cardápio</h2>
                  <div className="relative w-64">
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    <input 
                      type="text" 
                      placeholder="Buscar comida ou bebida..." 
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-semibold transition-all
                      ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-semibold transition-all flex items-center gap-2
                        ${selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      <i className={`fas ${cat.icon}`}></i> {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {getFilteredProducts().map(product => (
                    <button 
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={!product.isAvailable}
                      className={`bg-white dark:bg-gray-800 p-3 rounded-xl border transition-all text-left flex flex-col h-full group
                        ${!product.isAvailable ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-md cursor-pointer'}`}
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden relative">
                         {product.imageUrl ? (
                           <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/>
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fas fa-utensils text-2xl"></i></div>
                         )}
                         {cart.find(i => i.product.id === product.id) && (
                           <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                             {cart.find(i => i.product.id === product.id)?.quantity}
                           </div>
                         )}
                         {/* Hover Effect Add Button */}
                         <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                                <i className="fas fa-plus text-primary"></i>
                            </div>
                         </div>
                      </div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-2 mb-1 flex-1">{product.name}</h4>
                      <div className="text-primary font-bold text-sm">{product.price} MZN</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Details & Cart */}
            <div className="w-full md:w-2/5 lg:w-1/3 bg-white dark:bg-gray-800 flex flex-col h-full border-l border-gray-200 dark:border-gray-700 shadow-xl z-10">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {editingOrder ? 'Atualizar Pedido' : 'Novo Pedido'}
                </h2>
                <button onClick={() => setIsNewOrderOpen(false)} className="text-gray-400 hover:text-red-500">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* SECTION: Customer Info */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-4 overflow-y-auto max-h-[40vh]">
                
                {/* 1. Tipo de Pedido */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Tipo de Serviço</label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                    {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as OrderType[]).map(type => {
                        // Check restrictions for Delivery
                        const isDelivery = type === 'DELIVERY';
                        const isLocked = isDelivery && !hasPermission('PRO');
                        
                        return (
                            <button
                                key={type}
                                onClick={() => {
                                    if (isLocked) {
                                        triggerUpgrade('Delivery', 'PRO');
                                    } else {
                                        setOrderType(type);
                                    }
                                }}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all relative
                                ${orderType === type 
                                    ? 'bg-white dark:bg-gray-600 text-primary dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-gray-600' 
                                    : isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                {type === 'DINE_IN' ? 'Salão' : type === 'TAKEAWAY' ? 'Balcão' : 'Delivery'}
                                {isLocked && (
                                    <i className="fas fa-lock absolute top-1 right-2 text-[8px] text-gray-400"></i>
                                )}
                            </button>
                        );
                    })}
                  </div>
                </div>

                {/* 2. Detalhes Dinâmicos */}
                <div className="space-y-3 animate-fade-in-down">
                    
                    {/* DELIVERY FIELDS */}
                    {orderType === 'DELIVERY' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nome Completo *</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Ex: Ana Maria"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Contacto *</label>
                                    <input 
                                        type="tel" 
                                        className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="84 123 4567"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Idade</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Anos"
                                        value={customerAge}
                                        onChange={(e) => setCustomerAge(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3">
                                     <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Localização / Endereço *</label>
                                     <input 
                                         type="text" 
                                         className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                         placeholder="Bairro, Rua, Nº Casa..."
                                         value={customerAddress}
                                         onChange={(e) => setCustomerAddress(e.target.value)}
                                     />
                                </div>
                            </div>
                        </>
                    )}

                    {/* DINE IN FIELDS */}
                    {orderType === 'DINE_IN' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Mesa *</label>
                                <select 
                                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                >
                                    <option value="">Escolher...</option>
                                    {localTables.filter(t => t.status === 'AVAILABLE' || t.id === selectedTable).map(table => (
                                        <option key={table.id} value={table.id}>Mesa {table.number} ({table.capacity} lug.)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nº Pessoas</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                    value={numberOfGuests}
                                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    {/* TAKEAWAY FIELDS */}
                    {orderType === 'TAKEAWAY' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Nome Cliente</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Nome..."
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Telefone</label>
                                <input 
                                    type="tel" 
                                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Opcional"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Itens ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
                </div>

                {cart.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                    <i className="fas fa-shopping-basket text-3xl mb-2 opacity-50"></i>
                    <p className="text-sm">Carrinho vazio</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="relative group bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <div className="font-bold text-gray-800 dark:text-white text-sm">{item.product.name}</div>
                              <div className="text-xs text-primary font-semibold">{item.product.price} MZN</div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-gray-900 dark:text-white mb-1">{item.product.price * item.quantity} MZN</div>
                          </div>
                      </div>
                      
                      {/* Controls Row */}
                      <div className="flex items-center justify-between mt-2">
                          <input 
                              type="text" 
                              placeholder="Para quem? (Obs)"
                              value={item.notes}
                              onChange={(e) => updateItemNote(item.product.id, e.target.value)}
                              className="text-xs border-b border-gray-200 dark:border-gray-600 focus:border-primary outline-none w-32 py-1 bg-transparent text-gray-600 dark:text-gray-300 placeholder-gray-400"
                          />
                          
                          <div className="flex items-center gap-3">
                                <div className="flex items-center bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                                    <button 
                                        onClick={() => updateQuantity(item.product.id, -1)}
                                        className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-primary active:bg-gray-200 dark:active:bg-gray-500 rounded-l-lg"
                                    >
                                        -
                                    </button>
                                    <span className="w-6 text-center text-xs font-bold dark:text-white">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.product.id, 1)}
                                        className="w-6 h-6 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-primary active:bg-gray-200 dark:active:bg-gray-500 rounded-r-lg"
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="text-gray-300 dark:text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                          </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Summary */}
              <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Total a Pagar</span>
                  <span className="text-3xl font-bold text-primary">{cartTotal} MZN</span>
                </div>
                <button 
                  onClick={handleCreateOrder}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                    ${cart.length > 0
                      ? 'bg-primary text-white hover:bg-primary-light hover:-translate-y-1' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'}`}
                >
                  <i className="fas fa-check-circle"></i> {editingOrder ? 'Atualizar Pedido' : 'Confirmar Pedido'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- ADD INGREDIENT MODAL (New Item) --- */}
      {isNewIngredientOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsNewIngredientOpen(false)}></div>
           <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fade-in_0.2s_ease-out] transition-colors">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Novo Insumo no Estoque</h2>
               <button onClick={() => setIsNewIngredientOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                 <i className="fas fa-times text-xl"></i>
               </button>
             </div>
             
             <form onSubmit={handleAddIngredient} className="p-6 space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Nome do Item *</label>
                   <input 
                     type="text" 
                     className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                     placeholder="Ex: Arroz Basmati"
                     value={ingForm.name}
                     onChange={e => setIngForm({...ingForm, name: e.target.value})}
                     required
                   />
                </div>
                
                {/* Visual Category Field (Not in Schema, but per request UI) */}
                <div>
                   <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Categoria (Opcional)</label>
                   <input 
                     type="text" 
                     className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                     placeholder="Ex: Grãos, Carnes, Bebidas"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Unidade *</label>
                     <select 
                       className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                       value={ingForm.unit}
                       onChange={e => setIngForm({...ingForm, unit: e.target.value as StockUnit})}
                     >
                       <option value="KG">Quilo (KG)</option>
                       <option value="L">Litro (L)</option>
                       <option value="UNIT">Unidade (UN)</option>
                       <option value="PACK">Pacote</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Quantidade Inicial *</label>
                     <input 
                       type="number" 
                       step="0.01"
                       min="0"
                       className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                       placeholder="0.00"
                       value={ingForm.stock}
                       onChange={e => setIngForm({...ingForm, stock: e.target.value})}
                       required
                     />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Alerta Mínimo *</label>
                     <input 
                       type="number" 
                       step="0.01"
                       min="0"
                       className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                       placeholder="Ex: 5.0"
                       value={ingForm.minAlert}
                       onChange={e => setIngForm({...ingForm, minAlert: e.target.value})}
                       required
                     />
                     <p className="text-[10px] text-gray-400 mt-1">Nível Mínimo de Estoque</p>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Custo por Unidade *</label>
                     <input 
                       type="number" 
                       step="0.01"
                       min="0"
                       className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                       placeholder="MZN"
                       value={ingForm.cost}
                       onChange={e => setIngForm({...ingForm, cost: e.target.value})}
                       required
                     />
                   </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-light transition-all mt-4"
                >
                  <i className="fas fa-check mr-2"></i> Cadastrar
                </button>
             </form>
           </div>
        </div>
      )}

      {/* --- UPDATE STOCK MODAL (Existing Item) --- */}
      {updateStockModal.isOpen && updateStockModal.item && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setUpdateStockModal({isOpen: false, item: null})}></div>
           <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fade-in_0.2s_ease-out] transition-colors">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
               <h2 className="text-lg font-bold text-gray-900 dark:text-white">Atualizar Estoque</h2>
               <button onClick={() => setUpdateStockModal({isOpen: false, item: null})} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                 <i className="fas fa-times text-xl"></i>
               </button>
             </div>
             
             <form onSubmit={handleSaveStockUpdate} className="p-6 space-y-6">
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Nome do Item</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {updateStockModal.item.name}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Estoque Atual</label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {updateStockModal.item.currentStock} {updateStockModal.item.unit}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Adicionar Quantidade *</label>
                     <input 
                       type="number" 
                       step="0.01"
                       min="0"
                       className="w-full p-2 border rounded-lg text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                       placeholder="0.00"
                       value={stockToAdd}
                       onChange={e => setStockToAdd(e.target.value)}
                       autoFocus
                       required
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Unidade</label>
                     <select 
                       className="w-full p-2 border rounded-lg text-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 focus:ring-0 outline-none cursor-not-allowed"
                       value={updateStockModal.item.unit}
                       disabled
                     >
                       <option value="KG">Quilo (KG)</option>
                       <option value="L">Litro (L)</option>
                       <option value="UNIT">Unidade (UN)</option>
                       <option value="PACK">Pacote</option>
                     </select>
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button 
                        type="button"
                        onClick={() => setUpdateStockModal({isOpen: false, item: null})}
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="flex-1 py-3 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary-light transition-all"
                    >
                        Salvar
                    </button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirmation(null)}></div>
           <div className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-[fade-in_0.2s_ease-out] text-center transition-colors">
             <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
               <i className="fas fa-trash-alt"></i>
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tem certeza?</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6">
               Você está prestes a excluir <strong>{deleteConfirmation.name}</strong>. Esta ação não pode ser desfeita.
             </p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setDeleteConfirmation(null)}
                 className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
               >
                 Cancelar
               </button>
               <button 
                 onClick={confirmDelete}
                 className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md"
               >
                 Sim, excluir
               </button>
             </div>
           </div>
        </div>
      )}

      {/* --- ORDER DETAILS, HISTORY MODAL ETC ALREADY ABOVE --- */}
      {/* Ensuring they render correctly when selectedOrder or historyModalData is set */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fade-in_0.2s_ease-out] transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-700/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                             Detalhes do Pedido <span className="text-primary">#{selectedOrder.id.slice(-4)}</span>
                        </h2>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {selectedOrder.type === 'DINE_IN' ? 'Consumo no Local' : selectedOrder.type === 'DELIVERY' ? 'Entrega' : 'Retirada'} • {new Date(selectedOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {/* Customer Info */}
                    <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <div>
                             <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Cliente / Mesa</p>
                             <p className="font-bold text-gray-900 dark:text-white">
                                {selectedOrder.tableId 
                                    ? `Mesa ${localTables.find(t => t.id === selectedOrder.tableId)?.number}` 
                                    : (selectedOrder.customerId || 'Cliente não identificado')}
                             </p>
                        </div>
                         <div className="text-right">
                             <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Total</p>
                             <p className="font-bold text-primary text-lg">{selectedOrder.totalAmount} MZN</p>
                        </div>
                    </div>

                    {/* Items List (Computed on the fly for display) */}
                    <div className="space-y-3 mb-6">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-100 dark:border-gray-700 pb-2">Itens do Pedido</h4>
                        {mockDatabase.orderItems
                            .filter(item => item.orderId === selectedOrder.id)
                            .map((item, idx) => {
                                const prod = mockDatabase.products.find(p => p.id === item.productId);
                                return (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex gap-3">
                                            <span className="font-bold text-gray-500 dark:text-gray-400">{item.quantity}x</span>
                                            <div>
                                                <p className="text-gray-800 dark:text-gray-200">{prod?.name || 'Item removido'}</p>
                                                {item.notes && <p className="text-xs text-gray-500 italic">Obs: {item.notes}</p>}
                                            </div>
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                                            {item.unitPrice * item.quantity} MZN
                                        </span>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Action Area */}
                    {selectedOrder.status === 'PENDING' && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                            <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase">
                                <i className="far fa-clock mr-1"></i> Tempo Estimado de Preparo/Entrega
                            </label>
                            <div className="flex gap-2">
                                {[15, 30, 45, 60].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setEstimatedTime(`${time} min`)}
                                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                            estimatedTime === `${time} min` 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400'
                                        }`}
                                    >
                                        {time} min
                                    </button>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                placeholder="Ou digite (ex: 1h 20min)"
                                className="w-full mt-3 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
                     {selectedOrder.status === 'PENDING' ? (
                        <>
                            <button 
                                onClick={handleRejectOrder} 
                                className="flex-1 py-3 bg-white dark:bg-gray-800 text-red-500 border border-red-200 dark:border-red-900/30 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Rejeitar
                            </button>
                            <button 
                                onClick={handleAcceptOrder} 
                                className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-check"></i> Aceitar Pedido
                            </button>
                        </>
                     ) : (
                         <button 
                            onClick={() => setSelectedOrder(null)}
                            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Fechar
                        </button>
                     )}
                </div>
            </div>
        </div>
      )}

    </div>
    </div>
  );
};