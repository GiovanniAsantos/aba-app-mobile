import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '@env';

// Configurar para fechar automaticamente o browser após o redirect
WebBrowser.maybeCompleteAuthSession();

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleDeepLink: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingCode, setProcessingCode] = useState<string | null>(null);
  const processedCodesRef = React.useRef(new Set<string>());

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
    // No Android, avisar o WebBrowser que a auth foi concluída
    WebBrowser.maybeCompleteAuthSession({ skipRedirectCheck: true });
    handleDeepLink(event.url);
  };

  const handleDeepLink = async (url: string) => {
    // Ignorar deep links do Expo que não são do Keycloak
    if (url.startsWith('exp://') && !url.includes('code=') && !url.includes('error=')) {
      return;
    }
    
    try {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const error = urlObj.searchParams.get('error');
      const errorDescription = urlObj.searchParams.get('error_description');
      
      if (error) {
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
        // Verificar se este código já está sendo processado ou já foi processado
        if (processingCode === code) {
          return;
        }
        
        if (processedCodesRef.current.has(code)) {
          return;
        }
        
        // Marcar como processando
        setProcessingCode(code);
        processedCodesRef.current.add(code);
        
        // Trocar o code por tokens
        await exchangeCodeForTokens(code);
        
        // Limpar após processar
        setProcessingCode(null);
      }
    } catch (error) {
      console.error('Erro ao processar deep link:', error);
      Alert.alert('Erro', 'Erro ao processar autenticação');
      setProcessingCode(null);
    }
  };

  const exchangeCodeForTokens = async (code: string) => {
    try {
      setIsLoading(true);
      
      const tokenUrl = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
      const redirectUri = 'abablockchain://callback';
      
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
      } else {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', response.status, errorData);
        
        // Mensagens de erro mais específicas
        let errorMessage = 'Falha ao obter tokens';
        
        if (errorData.error === 'invalid_grant') {
          if (errorData.error_description?.includes('Code not valid')) {
            errorMessage = 'Código de autorização inválido ou já usado. Por favor, tente fazer login novamente.';
          } else if (errorData.error_description?.includes('expired')) {
            errorMessage = 'Código de autorização expirou. Por favor, tente fazer login novamente.';
          } else {
            errorMessage = 'Erro de autorização: ' + errorData.error_description;
          }
        } else if (errorData.error_description) {
          errorMessage = errorData.error_description;
        }
        
        Alert.alert('Erro de Autenticação', errorMessage);
      }
    } catch (error) {
      console.error('❌ Erro ao trocar code por tokens:', error);
      Alert.alert('Erro', 'Erro ao processar autenticação: ' + (error as Error).message);
    } finally {
      console.log('🏁 Finalizando, setIsLoading(false)');
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const authUrl = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;
      const redirectUri = 'abablockchain://callback';
      
      const params = new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid',
      });

      const fullUrl = `${authUrl}?${params.toString()}`;
      
      // Testar se o Keycloak está acessível
      try {
        const testResponse = await fetch(KEYCLOAK_URL, { method: 'HEAD' });
      } catch (testError) {
        Alert.alert(
          'Erro de Conexão',
          `Não foi possível conectar ao Keycloak.\n\nVerifique:\n1. Seu dispositivo está na mesma rede?\n2. O IP ${KEYCLOAK_URL} está correto?\n3. O Keycloak está rodando?`
        );
        return;
      }
      
      // WORKAROUND: No Android com Expo Go, usar navegador externo
      const isExpoGo = Constants.appOwnership === 'expo';
      const isAndroid = Platform.OS === 'android';
      
      if (isAndroid && isExpoGo) {
        Alert.alert(
          '⚠️ Limitação do Expo Go',
          'No Android com Expo Go, o deep link customizado não funciona.\n\n' +
          'INSTRUÇÕES:\n' +
          '1. Você será redirecionado ao navegador\n' +
          '2. Faça login no Keycloak\n' +
          '3. Após o login, IGNORE qualquer erro de redirecionamento\n' +
          '4. Volte ao app Expo Go manualmente\n' +
          '5. O app deve detectar o login automaticamente\n\n' +
          '💡 Para resolver isso definitivamente, faça um build standalone do app.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Entendi, continuar',
              onPress: async () => {
                const canOpen = await Linking.canOpenURL(fullUrl);
                if (canOpen) {
                  await Linking.openURL(fullUrl);
                } else {
                  Alert.alert('Erro', 'Não foi possível abrir o navegador');
                }
              }
            }
          ]
        );
        return;
      }
      
      // iOS ou Build Standalone: usar WebBrowser integrado
      const browserOptions: WebBrowser.WebBrowserOpenOptions = Platform.OS === 'android' 
        ? {
            showTitle: true,
            enableBarCollapsing: false,
          }
        : {};
      
      const result = await WebBrowser.openAuthSessionAsync(
        fullUrl, 
        redirectUri,
        browserOptions
      );
      
      // Processar o resultado
      if (result.type === 'success' && result.url) {
        await handleDeepLink(result.url);
      } else if (result.type === 'cancel') {
        // Usuário cancelou
      } else if (result.type === 'dismiss') {
        Alert.alert(
          'Login Cancelado',
          'Você fechou o navegador antes de completar o login.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao iniciar login: ' + (error as Error).message);
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
