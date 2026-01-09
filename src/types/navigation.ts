/**
 * Tipos de navegação para type-safety
 * 
 * Para adicionar novas rotas:
 * 1. Adicione o nome da rota aqui com seus parâmetros (ou undefined se não tiver)
 * 2. Crie a tela correspondente em src/screens/
 * 3. Adicione a rota no AppNavigator
 */

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Assinatura: undefined;
  Blockchain: undefined;
  BPMS: undefined;
  Cloud: undefined;
  Environments: undefined;
  // Adicione novas rotas aqui seguindo o padrão:
  // NomeDaTela: { parametro1: tipo, parametro2: tipo } | undefined;
};

// Types para usar nos componentes
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
