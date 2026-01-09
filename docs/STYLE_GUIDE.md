# Guia de Padronização - Separação de Componentes e Estilos

## 📁 Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── index.ts         # Exportações centralizadas
│   ├── button/
│   │   ├── ButtonComponent.tsx
│   │   ├── style.ts
│   │   └── types.ts (opcional)
│   ├── input/
│   │   ├── InputComponent.tsx
│   │   └── style.ts
│   └── card/
│       ├── CardComponent.tsx
│       └── style.ts
├── screens/             # Telas da aplicação
│   ├── login/
│   │   ├── index.tsx    # Componente principal
│   │   └── styles.ts    # Estilos da tela
│   └── home/
│       ├── HomeScreen.tsx
│       └── styles.ts
```

## 🎨 Padrão de Estilização

### 1. Arquivo de Estilos (style.ts ou styles.ts)

```typescript
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  // ... outros estilos
});

// SEMPRE exporte como 'export const styles' ou 'export default styles'
```

### 2. Componente (ComponentName.tsx)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './style';  // Importar estilos

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export default function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
```

## 📝 Padrões Recomendados

### ✅ FAÇA

```typescript
// ✅ Exporte os estilos
export const styles = StyleSheet.create({ ... });

// ✅ Use nomes descritivos
button: { ... }
buttonPrimary: { ... }
buttonDisabled: { ... }

// ✅ Agrupe estilos relacionados
// Botões
button: { ... }
buttonText: { ... }
buttonIcon: { ... }

// Container
container: { ... }
containerPadded: { ... }

// ✅ Use tipagem TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'large';
}
```

### ❌ NÃO FAÇA

```typescript
// ❌ Não use 'const' sem export
const styles = StyleSheet.create({ ... });

// ❌ Não deixe estilos inline no componente
<View style={{ flex: 1, padding: 20 }}>  // Evite

// ❌ Não use nomes genéricos demais
style1: { ... }
container1: { ... }
text: { ... }
```

## 🔄 Refatorando Componentes Existentes

### Antes (tudo junto):
```typescript
// LoginScreen.tsx
import { StyleSheet } from 'react-native';

export default function LoginScreen() {
  return <View style={styles.container}>...</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24 },
});
```

### Depois (separado):
```typescript
// LoginScreen.tsx (ou index.tsx)
import { styles } from './styles';

export default function LoginScreen() {
  return <View style={styles.container}>...</View>;
}
```

```typescript
// styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24 },
});
```

## 🎯 Exemplo Prático Completo

### Componente Card

**src/components/card/CardComponent.tsx**
```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './style';

interface CardProps {
  title: string;
  description: string;
  onPress?: () => void;
}

export default function Card({ title, description, onPress }: CardProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </Container>
  );
}
```

**src/components/card/style.ts**
```typescript
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
```

## 🚀 Como Usar no Projeto

### 1. Importar componentes
```typescript
// Forma 1: Importação direta
import Button from '@/components/button/ButtonComponent';

// Forma 2: Importação centralizada (recomendado)
import { Button } from '@/components';
```

### 2. Usar componente
```typescript
<Button 
  title="Entrar"
  variant="primary"
  size="large"
  onPress={handleLogin}
  loading={isLoading}
/>
```

## 📚 Telas vs Componentes

### Telas (screens/)
- Use **styles.ts** (plural)
- Estilos específicos da tela
- Não reutilizáveis

### Componentes (components/)
- Use **style.ts** (singular)
- Estilos reutilizáveis
- Genéricos e flexíveis

## 🎨 Dicas de Organização

1. **Cores e Temas**: Crie um arquivo de constantes
   ```typescript
   // src/constants/colors.ts
   export const colors = {
     primary: '#007AFF',
     secondary: '#5856D6',
     danger: '#FF3B30',
     success: '#34C759',
   };
   ```

2. **Espaçamentos**: Padronize espaçamentos
   ```typescript
   // src/constants/spacing.ts
   export const spacing = {
     xs: 4,
     sm: 8,
     md: 16,
     lg: 24,
     xl: 32,
   };
   ```

3. **Tipografia**: Centralize fontes
   ```typescript
   // src/constants/typography.ts
   export const typography = {
     h1: { fontSize: 32, fontWeight: 'bold' },
     h2: { fontSize: 24, fontWeight: 'bold' },
     body: { fontSize: 16 },
   };
   ```

## ✨ Benefícios

✅ Código mais limpo e organizado
✅ Fácil manutenção
✅ Reutilização de componentes
✅ Melhor colaboração em equipe
✅ TypeScript com autocomplete
✅ Separação de responsabilidades
