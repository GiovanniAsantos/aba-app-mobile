import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

export default function EnvironmentsScreen({ navigation }: NavigationProps<'Environments'>) {
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="server" size={32} color="#4F6AF5" />
          <Text style={styles.title}>Ambientes</Text>
          <Text style={styles.subtitle}>Gerencie seus ambientes</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <MaterialCommunityIcons name="server-network" size={48} color="#f59e0b" />
            <Text style={styles.cardTitle}>Servidores</Text>
            <Text style={styles.cardText}>Configure e monitore ambientes</Text>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
