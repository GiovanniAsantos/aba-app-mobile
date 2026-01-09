import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Linking, Alert } from 'react-native';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '@env';

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  login: () => void;
  logout: () => void;
  handleDeepLink: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado (pode buscar do AsyncStorage se implementar)
    checkAuthStatus();
    
    // Listener para deep links
    const subscription = Linking.addEventListener('url', handleDeepLinkEvent);
    
    // Verificar URL inicial (caso app seja aberto via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkAuthStatus = async () => {
    // Aqui você pode verificar se tem token salvo
    // Por exemplo, usando AsyncStorage
    setIsLoading(false);
  };

  const handleDeepLinkEvent = (event: { url: string }) => {
    handleDeepLink(event.url);
  };

  const handleDeepLink = async (url: string) => {
    console.log('Deep link recebido:', url);
    
    try {
      // Parse da URL de callback do Keycloak
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');
      const errorDescription = urlObj.searchParams.get('error_description');
      
      if (error) {
        console.error('Erro do Keycloak:', error, errorDescription);
        
        // Mensagens mais amigáveis
        let message = 'Erro na autenticação';
        if (error === 'authentication_expired') {
          message = 'O tempo para fazer login expirou. Tente novamente.';
        } else if (error === 'access_denied') {
          message = 'Acesso negado pelo usuário.';
        } else if (errorDescription) {
          message = errorDescription;
        }
        
        Alert.alert('Erro', message);
        return;
      }
      
      if (code) {
        // Trocar o code por tokens
        await exchangeCodeForTokens(code);
      }
    } catch (error) {
      console.error('Erro ao processar deep link:', error);
      Alert.alert('Erro', 'Erro ao processar autenticação');
    }
  };

  const exchangeCodeForTokens = async (code: string) => {
    try {
      setIsLoading(true);
      
      const tokenUrl = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
      const redirectUri = 'abablockchain://home';
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: KEYCLOAK_CLIENT_ID,
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (response.ok) {
        const data = await response.json();
        
        const newTokens: AuthTokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          idToken: data.id_token,
        };
        
        setTokens(newTokens);
        
        // Aqui você pode salvar os tokens no AsyncStorage
        console.log('Autenticação bem-sucedida!');
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', 'Falha ao obter tokens: ' + errorData.error_description);
      }
    } catch (error) {
      console.error('Erro ao trocar code por tokens:', error);
      Alert.alert('Erro', 'Erro ao processar autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    try {
      console.log('=== DEBUG LOGIN ===');
      console.log('KEYCLOAK_URL:', KEYCLOAK_URL);
      console.log('KEYCLOAK_REALM:', KEYCLOAK_REALM);
      console.log('KEYCLOAK_CLIENT_ID:', KEYCLOAK_CLIENT_ID);
      
      const authUrl = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;
      const redirectUri = 'abablockchain://home';
      
      const params = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid',
      });

      const fullUrl = `${authUrl}?${params.toString()}`;
      
      console.log('Full URL:', fullUrl);
      console.log('===================');
      
      Linking.openURL(fullUrl).catch((err) => {
        console.error('Erro ao abrir Keycloak:', err);
        Alert.alert('Erro', 'Não foi possível abrir a página de login');
      });
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Erro ao iniciar login');
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        const logoutUrl = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;
        
        await fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CLIENT_ID,
            refresh_token: tokens.refreshToken,
          }).toString(),
        });
      }
      
      setTokens(null);
      // Limpar AsyncStorage se estiver usando
      console.log('Logout realizado');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar tokens localmente
      setTokens(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!tokens,
        isLoading,
        tokens,
        login,
        logout,
        handleDeepLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}
