import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { UserInfo, UserInfoResponse } from '@/types/api';
import { apiAccountUrlV1 } from '@/config/api';
import { useAuth } from './AuthProvider';

interface UserContextType {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  refreshUserInfo: () => Promise<void>;
  clearUserInfo: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { tokens } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!tokens?.accessToken) {
        throw new Error('Token de acesso não encontrado');
      }

      const response = await fetch(`${apiAccountUrlV1}/accounts/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar informações: ${response.status}`);
      }

      const data: UserInfoResponse = await response.json();
      setUserInfo(data.content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao carregar informações do usuário:', error);
      setError(errorMessage);
      
      Alert.alert(
        'Erro',
        'Não foi possível carregar suas informações. Tente novamente mais tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshUserInfo = async () => {
    await loadUserInfo();
  };

  const clearUserInfo = () => {
    setUserInfo(null);
    setError(null);
  };

  useEffect(() => {
    if (tokens?.accessToken) {
      loadUserInfo();
    } else {
      setLoading(false);
      clearUserInfo();
    }
  }, [tokens?.accessToken]);

  return (
    <UserContext.Provider
      value={{
        userInfo,
        loading,
        error,
        refreshUserInfo,
        clearUserInfo,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}
