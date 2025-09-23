'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KEY = "humandns_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem(KEY);
      setTokenState(storedToken);
      setIsAuthenticated(!!storedToken);
    }
  }, []);

  const setToken = (newToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, newToken);
    }
    setTokenState(newToken);
    setIsAuthenticated(true);
  };

  const clearToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(KEY);
    }
    setTokenState(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      token,
      setToken,
      clearToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
