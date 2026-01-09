import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Importar telas
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/login/LoginScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Navegador principal da aplicação
 * 
 * Para adicionar novas telas:
 * 1. Importe a tela no topo deste arquivo
 * 2. Adicione um <Stack.Screen /> com name, component e options
 * 3. Configure as opções de header conforme necessário
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Descomente para remover header globalmente:
        // headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: false, // Remove header da tela de login
        }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Início',
          headerBackVisible: false, // Remove botão voltar
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerBackVisible: false, // Remove botão voltar
        }}
      />
      
      {/* Adicione novas telas aqui seguindo o padrão:
      <Stack.Screen 
        name="NomeDaTela" 
        component={NomeDoComponente}
        options={{
          title: 'Título no Header',
          // Outras opções...
        }}
      />
      */}
    </Stack.Navigator>
  );
}
