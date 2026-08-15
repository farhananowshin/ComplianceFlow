import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import apiClient from '../lib/api-client';
import { User, Company } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tenantCompany: Company | null;
  selectedCompanyId: string | undefined;
  selectedCompanyScope: string;
  setSelectedCompanyScope: (scope: string) => void;
  companies: Company[];
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  setTenantCompany: (company: Company | null) => void;
  refreshProfile: () => Promise<void>;
  fetchCompaniesList: () => Promise<void>;
  switchUserRole: (role: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('complianceflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tenantCompany, setTenantCompanyState] = useState<Company | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Sync token to localStorage
  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('complianceflow_token', newToken);
    } else {
      localStorage.removeItem('complianceflow_token');
    }
  };

  // Set selected Tenant Company
  const setTenantCompany = (comp: Company | null) => {
    setTenantCompanyState(comp);
    if (comp) {
      localStorage.setItem('complianceflow_tenant_id', comp.id || (comp as any)._id);
    } else {
      localStorage.removeItem('complianceflow_tenant_id');
    }
  };

  // Fetch Companies list for tenant selector
  const fetchCompaniesList = useCallback(async () => {
    try {
      const response: any = await apiClient.get('/companies?limit=100');
      const payload = response?.data || response;
      if (payload) {
        const fetchedComps: Company[] = Array.isArray(payload) ? payload : (payload.companies || []);
        setCompanies(fetchedComps);

        // Auto-select initial tenant company if not already set
        const savedTenantId = localStorage.getItem('complianceflow_tenant_id');
        if (savedTenantId) {
          const matched = fetchedComps.find((c) => c.id === savedTenantId || (c as any)._id === savedTenantId);
          if (matched) setTenantCompanyState(matched);
        } else if (fetchedComps.length > 0) {
          setTenantCompany(fetchedComps[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies list:', err);
    }
  }, []);

  // Fetch Current User Profile
  const refreshProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response: any = await apiClient.get('/auth/me');
      const payload = response?.data || response;
      if (payload) {
        const userData = payload.user || payload;
        setUser(userData);
        await fetchCompaniesList();
      }
    } catch (err) {
      console.error('Session expired or profile fetch failed:', err);
      handleSetToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
      isInitialLoadRef.current = false;
    }
  }, [token, fetchCompaniesList]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Listen for unauthorized events dispatched from api-client
  useEffect(() => {
    const handleUnauthorized = () => {
      handleSetToken(null);
      setUser(null);
      if (!isInitialLoadRef.current) {
        toast.error('Session expired. Please log in again.');
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Login handler
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      isInitialLoadRef.current = true; // Suspend unauthorized toasts during login transitions
      const res: any = await apiClient.post('/auth/login', { email, password });
      const payload = res?.data || res;
      if (payload && payload.token) {
        const newToken = payload.token;
        const loggedUser = payload.user;
        handleSetToken(newToken);
        setUser(loggedUser);
        toast.success(`Welcome back, ${loggedUser.name}!`);
        await fetchCompaniesList();
        isInitialLoadRef.current = false;
        return true;
      }
      isInitialLoadRef.current = false;
      return false;
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      isInitialLoadRef.current = false;
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const [selectedCompanyScope, setSelectedCompanyScopeState] = useState<string>('all');

  const setSelectedCompanyScope = (scope: string) => {
    setSelectedCompanyScopeState(scope);
    if (scope !== 'all') {
      const found = companies.find((c) => c.id === scope || (c as any)._id === scope);
      if (found) setTenantCompany(found);
    }
  };

  const switchUserRole = (role: any) => {
    if (user) {
      setUser({ ...user, role });
      toast.success(`Role updated to ${role}`);
    }
  };

  // Logout handler
  const logout = () => {
    handleSetToken(null);
    setUser(null);
    setTenantCompany(null);
    toast.success('Logged out successfully.');
  };

  const selectedCompanyId = tenantCompany ? (tenantCompany.id || (tenantCompany as any)._id) : undefined;

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        token,
        isAuthenticated: !!user,
        isLoading,
        tenantCompany,
        selectedCompanyId,
        selectedCompanyScope,
        setSelectedCompanyScope,
        companies,
        login,
        logout,
        setTenantCompany,
        refreshProfile,
        fetchCompaniesList,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
