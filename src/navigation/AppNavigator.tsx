import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Importar telas
import HomeScreen from '../screens/home/HomeScreen';
import LoginScreen from '../screens/login/LoginScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import AssinaturaScreen from '@/screens/assinatura/AssinaturaScreen';
import BPMSScreen from '@/screens/bpms/BPMSScreen';
import CloudScreen from '@/screens/cloud/cloudTableScreen/CloudScreen';
import EnvironmentsScreen from '@/screens/environments/EnvironmentsScreen';
import SignDocumentScreen from '@/screens/assinatura/signDocument';
import SeeSignatureScreen from '@/screens/assinatura/seeSignature';
import MinhasAtividadesScreen from '@/screens/bpms/MinhasAtividadesScreen';

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
        animation: 'fade',
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
          headerShown: false, // Remove header (usa layout personalizado)
          headerBackVisible: false, // Remove botão voltar
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: false, // Remove header (usa layout personalizado)
          headerBackVisible: false, // Remove botão voltar
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="Assinatura" 
        component={AssinaturaScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="BPMS" 
        component={BPMSScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="Cloud" 
        component={CloudScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="Environments" 
        component={EnvironmentsScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />

      <Stack.Screen 
        name="Signature" 
        component={SeeSignatureScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen 
        name="SignDocument" 
        component={SignDocumentScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="MinhasAtividades" 
        component={MinhasAtividadesScreen}
        options={{
          headerShown: false,
          headerBackVisible: false,
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
