import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Tenant, PlanType } from '../types/schema';
import { users, currentTenant as mockTenant } from '../data/mockData';

type AuthModalType = 'login' | 'signup' | null;

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  modalType: AuthModalType;
  openLogin: () => void;
  openSignup: () => void;
  closeModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string, restaurantName: string, phone: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  hasPermission: (requiredPlan: PlanType) => boolean;
  updateTenantPlan: (plan: PlanType) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Plan hierarchy definition
const PLAN_LEVELS: Record<PlanType, number> = {
  STARTER: 1,
  PRO: 2,
  PREMIUM: 3
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [modalType, setModalType] = useState<AuthModalType>(null);

  const isAuthenticated = !!user;

  const openLogin = () => setModalType('login');
  const openSignup = () => setModalType('signup');
  const closeModal = () => setModalType(null);

  const login = async (email: string, password: string) => {
    // Simulating API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Backend Validation: Check against database
        const foundUser = users.find(u => u.email === email);
        
        if (foundUser) {
          // In a real backend, we would use bcrypt.compare(password, foundUser.passwordHash) here
          setUser(foundUser);
          
          setTenant({
            ...mockTenant,
            plan: 'PRO', 
            trialEndsAt: undefined 
          });
          closeModal();
          resolve();
        } else {
          // Security: Generic error message to prevent enumeration
          reject(new Error("Credenciais inválidas ou conta não encontrada."));
        }
      }, 1000);
    });
  };

  const loginWithGoogle = async () => {
    // Simulating Google OAuth 2.0 Popup and Callback
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            // Mock data returned from Google Provider
            const googleUser: User = {
                id: 'google_' + Date.now(),
                tenantId: 'google_tenant_' + Date.now(),
                name: 'Usuário Google',
                email: 'usuario@gmail.com',
                role: 'OWNER',
                avatarUrl: 'https://lh3.googleusercontent.com/a-/AOh14Gg...' // Mock Google Avatar URL
            };

            const googleTenant: Tenant = {
                ...mockTenant,
                id: googleUser.tenantId,
                name: 'Meu Restaurante (Google)',
                plan: 'PRO',
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Auto-activate 7 day trial
                isDemo: false
            };

            setUser(googleUser);
            setTenant(googleTenant);
            closeModal();
            resolve();
        }, 1500); // Network delay simulation
    });
  };

  const signup = async (name: string, email: string, password: string, restaurantName: string, phone: string) => {
    // Simulating API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Backend Validation: Check for duplicate email
        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
            reject(new Error("Este email já está cadastrado. Tente fazer login."));
            return;
        }

        const newUser: User = {
          id: 'new_' + Date.now(),
          name: name,
          email: email,
          role: 'OWNER',
          tenantId: 'new_tenant',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F766E&color=fff`
          // passwordHash: bcrypt.hash(password) -> Would happen on backend
        };
        setUser(newUser);
        
        // 1. Set Trial End Date (Now + 7 Days)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        // Create new tenant
        const newTenant: Tenant = {
          ...mockTenant,
          id: 'new_tenant',
          name: restaurantName,
          phone: phone, // Storing the phone number
          // 2. Start on PRO plan during trial
          plan: 'PRO', 
          trialEndsAt: trialEndDate.toISOString(),
          isDemo: false
        };
        setTenant(newTenant);
        
        closeModal();
        resolve();
      }, 1500);
    });
  };

  // Demo Mode Logic
  const loginAsDemo = async () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            const demoUser: User = {
                id: 'demo_visitor',
                tenantId: 'demo_tenant',
                name: 'Visitante Demo',
                email: 'demo@restroflow.com',
                role: 'OWNER',
                avatarUrl: 'https://ui-avatars.com/api/?name=Demo+Mode&background=F97316&color=fff'
            };
            
            const demoTenant: Tenant = {
                ...mockTenant,
                name: 'Restaurante Modelo (Demo)',
                plan: 'PREMIUM', // Full features for demo
                isDemo: true,    // Read-only flag
                trialEndsAt: undefined // No expiration for public demo
            };

            setUser(demoUser);
            setTenant(demoTenant);
            resolve();
        }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    setTenant(null);
  };

  const hasPermission = (requiredPlan: PlanType): boolean => {
    if (!tenant) return false;
    const currentLevel = PLAN_LEVELS[tenant.plan];
    const requiredLevel = PLAN_LEVELS[requiredPlan];
    return currentLevel >= requiredLevel;
  };

  const updateTenantPlan = (plan: PlanType) => {
    if (tenant) {
      // When upgrading, clear the trial date so they are "subscribed"
      setTenant({ ...tenant, plan, trialEndsAt: undefined });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      tenant,
      isAuthenticated, 
      modalType, 
      openLogin, 
      openSignup, 
      closeModal,
      login,
      loginWithGoogle,
      signup,
      loginAsDemo,
      logout,
      hasPermission,
      updateTenantPlan
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};