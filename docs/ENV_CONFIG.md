# Configuração de Variáveis de Ambiente

Este projeto usa `react-native-dotenv` para gerenciar variáveis de ambiente.

## Arquivos

- `.env` - Variáveis de ambiente (nunca commitar no git)
- `.env.example` - Exemplo de variáveis (pode commitar)
- `src/config/api.ts` - Configuração centralizada
- `src/types/env.d.ts` - Tipos TypeScript

## Como Usar

### 1. Importar diretamente do @env

```tsx
import { API_ACCOUNT_URL_V1, KEYCLOAK_URL } from '@env';

console.log(API_ACCOUNT_URL_V1);
```

### 2. Usar a configuração centralizada (Recomendado)

```tsx
import { api, keycloak } from '@/config/api';
// ou
import config from '@/config/api';

// Fazer requisição
fetch(`${api.account.v1}/users`)
  .then(response => response.json())
  .then(data => console.log(data));

// Usar keycloak
console.log(keycloak.url);
console.log(keycloak.realm);
```

### 3. Exemplo completo em um componente

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { api } from '@/config/api';

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${api.account.v1}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      {users.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </View>
  );
}
```

## Ambientes Diferentes

Para ter diferentes ambientes (dev, staging, prod), crie:

- `.env.development`
- `.env.staging`
- `.env.production`

E use:
```bash
# Desenvolvimento
ENVFILE=.env.development expo start

# Produção
ENVFILE=.env.production expo start
```

## APIs Disponíveis

### Contas
- `api.account.base` - API antiga
- `api.account.v1` - API v1
- `api.account.ws` - WebSocket

### Assinatura
- `api.signature.base` - API antiga
- `api.signature.v1` - API v1
- `api.signature.publicV1` - API pública v1
- `api.signature.ws` - WebSocket

### Cloud
- `api.cloud.base` - API base
- `api.cloud.public` - API pública

### BPMS
- `api.bpms.base` - API antiga
- `api.bpms.v1` - API v1
- `api.bpms.publicV1` - API pública v1
- `api.bpms.ws` - WebSocket

### Email
- `api.email.base` - API antiga
- `api.email.v1` - API v1
- `api.email.ws` - WebSocket

### Blockchain
- `api.orchestrator.url` - API Orchestrator
- `api.orchestrator.ws` - WebSocket

### Plans
- `api.plans.base` - API de planos

## Keycloak

```tsx
import { keycloak } from '@/config/api';

// Configurar autenticação
const authConfig = {
  url: keycloak.url,
  realm: keycloak.realm,
  clientId: keycloak.clientId,
};
```

## Assets (Logos)

```tsx
import { assets } from '@/config/api';
import { Image } from 'react-native';

<Image source={{ uri: assets.logoBlue }} />
<Image source={{ uri: assets.logoWhite }} />
<Image source={{ uri: assets.iconBlue }} />
```

## Importante

⚠️ Após alterar o `.env`, você precisa:
1. Parar o Metro Bundler (Ctrl+C)
2. Limpar o cache: `npx expo start --clear`
3. Reiniciar o app

## TypeScript

O TypeScript já está configurado para autocompletar e validar as variáveis de ambiente. Se adicionar novas variáveis:

1. Adicione no `.env`
2. Adicione a tipagem em `src/types/env.d.ts`
3. Importe e exporte em `src/config/api.ts`
