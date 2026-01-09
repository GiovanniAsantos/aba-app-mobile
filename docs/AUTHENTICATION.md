# Sistema de Autenticação Keycloak

## 📋 Visão Geral

O sistema de autenticação foi implementado usando **Context API** e **Deep Linking** para integrar com o Keycloak.

## 🔐 Fluxo de Autenticação

### 1. Usuário clica em "Entrar"
- O app chama `login()` do AuthProvider
- Abre o navegador externo com a URL do Keycloak
- Usuário faz login no Keycloak

### 2. Keycloak redireciona de volta
- URL de callback: `abablockchain://callback?code=...`
- App recebe o deep link via `Linking.addEventListener`
- AuthProvider processa o código de autorização

### 3. Troca de código por tokens
- AuthProvider faz requisição para `/token` do Keycloak
- Recebe `access_token`, `refresh_token`, `id_token`
- Armazena tokens no estado

### 4. Navegação automática
- LoginScreen detecta `isAuthenticated = true`
- Redireciona automaticamente para Home

## 📁 Arquivos Criados

### AuthProvider ([src/context/AuthProvider.tsx](src/context/AuthProvider.tsx))
```typescript
// Fornece:
- isAuthenticated: boolean
- isLoading: boolean
- tokens: AuthTokens | null
- login(): void
- logout(): void
- handleDeepLink(url: string): Promise<void>
```

### Configurações Necessárias

#### 1. Keycloak Client Configuration
No admin do Keycloak, configure:
- **Client ID**: `aba-app-mobile`
- **Valid Redirect URIs**: `abablockchain://*`
- **Access Type**: `public`
- **Standard Flow Enabled**: `ON`

#### 2. App Deep Link Scheme
Arquivo [app.json](app.json):
```json
{
  "scheme": "abablockchain"
}
```

#### 3. Variáveis de Ambiente ([.env](.env))
```env
KEYCLOAK_URL=http://192.168.80.161:8081/auth/
KEYCLOAK_REALM=abablockchain
KEYCLOAK_CLIENT_ID=aba-app-mobile
```

## 🚀 Como Usar

### Em qualquer componente:

```typescript
import { useAuth } from '@/context/AuthProvider';

function MyComponent() {
  const { isAuthenticated, tokens, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Button onPress={login} title="Fazer Login" />;
  }
  
  return (
    <View>
      <Text>Logado! Token: {tokens?.accessToken}</Text>
      <Button onPress={logout} title="Sair" />
    </View>
  );
}
```

### Proteger rotas:

```typescript
// Em uma tela protegida
function ProtectedScreen() {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login');
    }
  }, [isAuthenticated]);
  
  // ...resto do código
}
```

## 🔒 Fazendo Requisições Autenticadas

```typescript
import { useAuth } from '@/context/AuthProvider';

function MyComponent() {
  const { tokens } = useAuth();
  
  const fetchData = async () => {
    const response = await fetch('https://api.example.com/data', {
      headers: {
        'Authorization': `Bearer ${tokens?.accessToken}`,
      },
    });
    
    const data = await response.json();
    return data;
  };
  
  // ...
}
```

## 🔄 Refresh Token

Para implementar refresh automático de token:

```typescript
// Adicionar no AuthProvider.tsx
const refreshAccessToken = async () => {
  if (!tokens?.refreshToken) return;
  
  try {
    const response = await fetch(`${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        client_id: KEYCLOAK_CLIENT_ID,
      }).toString(),
    });
    
    if (response.ok) {
      const data = await response.json();
      setTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
      });
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    logout();
  }
};
```

## 💾 Persistir Tokens (Opcional)

Para manter o usuário logado após fechar o app, use AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ao obter tokens:
await AsyncStorage.setItem('@auth:tokens', JSON.stringify(tokens));

// Ao carregar app:
const storedTokens = await AsyncStorage.getItem('@auth:tokens');
if (storedTokens) {
  setTokens(JSON.parse(storedTokens));
}

// Ao fazer logout:
await AsyncStorage.removeItem('@auth:tokens');
```

## 🐛 Debugging

### Ver logs do deep link:
```typescript
useEffect(() => {
  Linking.addEventListener('url', (event) => {
    console.log('Deep link recebido:', event.url);
  });
}, []);
```

### Testar deep link manualmente:
```bash
# Android
adb shell am start -W -a android.intent.action.VIEW -d "abablockchain://callback?code=test123"

# iOS (simulador)
xcrun simctl openurl booted "abablockchain://callback?code=test123"
```

## ✅ Checklist de Implementação

- [x] AuthProvider criado
- [x] Deep linking configurado no app.json
- [x] LoginScreen integrado
- [x] HomeScreen com logout
- [x] Navegação condicional baseada em autenticação
- [ ] Persistência de tokens (AsyncStorage) - Opcional
- [ ] Refresh automático de tokens - Opcional
- [ ] Tratamento de erros refinado - Opcional

## 🎯 Próximos Passos

1. **Adicionar AsyncStorage** para persistir tokens
2. **Implementar refresh automático** de access_token
3. **Adicionar loading states** durante autenticação
4. **Criar interceptor** para adicionar token automaticamente em todas as requisições
5. **Implementar tratamento** de token expirado

## 📚 Recursos

- [Keycloak Documentation](https://www.keycloak.org/docs/latest/securing_apps/)
- [React Navigation Auth Flow](https://reactnavigation.org/docs/auth-flow/)
- [React Native Deep Linking](https://reactnative.dev/docs/linking)
