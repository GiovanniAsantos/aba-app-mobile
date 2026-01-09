# Estrutura de Navegação

Este projeto utiliza React Navigation com TypeScript para navegação type-safe.

## Estrutura de Pastas

```
src/
├── screens/          # Todas as telas da aplicação
├── navigation/       # Configuração de rotas e navegadores
├── components/       # Componentes reutilizáveis
└── types/           # Tipos TypeScript (incluindo navegação)
```

## Como Adicionar uma Nova Tela

### 1. Criar a tela em `src/screens/`

```tsx
// src/screens/MinhaNovaScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NavigationProps } from '../types/navigation';

export default function MinhaNovaScreen({ navigation, route }: NavigationProps<'MinhaNova'>) {
  return (
    <View style={styles.container}>
      <Text>Minha Nova Tela</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 2. Adicionar tipo em `src/types/navigation.ts`

```tsx
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  MinhaNova: { id: number }; // Com parâmetros
  // ou
  MinhaNova: undefined; // Sem parâmetros
};
```

### 3. Registrar rota em `src/navigation/AppNavigator.tsx`

```tsx
import MinhaNovaScreen from '../screens/MinhaNovaScreen';

// Dentro do Stack.Navigator:
<Stack.Screen 
  name="MinhaNova" 
  component={MinhaNovaScreen}
  options={{
    title: 'Minha Nova Tela',
  }}
/>
```

## Como Navegar Entre Telas

### Navegação simples

```tsx
navigation.navigate('Home');
```

### Navegação com parâmetros

```tsx
navigation.navigate('MinhaNova', { id: 123 });
```

### Acessar parâmetros na tela de destino

```tsx
const { id } = route.params;
```

### Voltar

```tsx
navigation.goBack();
```

### Substituir tela atual

```tsx
navigation.replace('Home');
```

## Opções Comuns de Configuração

### Remover header de uma tela específica

```tsx
<Stack.Screen 
  name="Login" 
  component={LoginScreen}
  options={{
    headerShown: false,
  }}
/>
```

### Customizar título

```tsx
options={{
  title: 'Meu Título',
  headerStyle: {
    backgroundColor: '#007AFF',
  },
  headerTintColor: '#fff',
}}
```

### Remover botão voltar

```tsx
options={{
  headerBackVisible: false,
}}
```

### Título dinâmico

```tsx
options={({ route }) => ({
  title: route.params.nome || 'Padrão',
})}
```

## TypeScript - Navegação Type-Safe

O projeto está configurado para ter navegação type-safe. O TypeScript vai:

- ✅ Autocompletar nomes de telas
- ✅ Verificar parâmetros obrigatórios
- ✅ Sugerir propriedades dos parâmetros
- ✅ Alertar sobre rotas inexistentes

## Estrutura Atual

- **Login** → Tela inicial de autenticação
- **Home** → Tela principal após login

## Próximos Passos

1. Adicione suas telas seguindo o padrão acima
2. Configure autenticação (se necessário)
3. Adicione navegação por abas (Bottom Tabs) ou drawer (se necessário)
4. Implemente deep linking (se necessário)
