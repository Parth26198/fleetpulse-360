import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company } from '../types';
import { Api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  companies: Company[];
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fleetpulse_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('fleetpulse_token');
      if (savedToken) {
        try {
          const res = await Api.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setSelectedCompanyId(res.data.user.company.id);
          }
        } catch (err) {
          localStorage.removeItem('fleetpulse_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Fetch companies for Super Admin
  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      Api.listCompanies()
        .then((res) => {
          if (res.data.success) setCompanies(res.data.companies);
        })
        .catch(() => {});
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await Api.login({ email, password });
    if (res.data.success) {
      const newToken = res.data.token;
      const loggedUser = res.data.user;
      localStorage.setItem('fleetpulse_token', newToken);
      setToken(newToken);
      setUser(loggedUser);
      setSelectedCompanyId(loggedUser.company.id);
    } else {
      throw new Error(res.data.message || 'Login failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('fleetpulse_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const hasPermission = (module: string, action: string) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN') return true;
    return user.permissions.includes(`${module}:${action}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        companies,
        selectedCompanyId,
        setSelectedCompanyId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
