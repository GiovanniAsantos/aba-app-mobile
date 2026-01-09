import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NavigationProps } from '../../types/navigation';

export default function HomeScreen({ navigation }: NavigationProps<'Home'>) {
  
  const handleLogout = () => {
    // Adicione aqui sua lógica de logout
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Bem-vindo ao seu app</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Navegação Configurada ✅</Text>
          <Text style={styles.cardText}>
            A estrutura de navegação está pronta para uso. Você pode adicionar novas telas
            seguindo o padrão estabelecido.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Como adicionar novas telas:</Text>
          <Text style={styles.cardText}>
            1. Crie o arquivo da tela em src/screens/{'\n'}
            2. Adicione o tipo em src/types/navigation.ts{'\n'}
            3. Registre a rota em src/navigation/AppNavigator.tsx
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
