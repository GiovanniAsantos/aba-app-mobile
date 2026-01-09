import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

export default function CloudScreen({ navigation }: NavigationProps<'Cloud'>) {
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="cloud" size={32} color="#4F6AF5" />
          <Text style={styles.title}>Nuvem</Text>
          <Text style={styles.subtitle}>Armazenamento seguro na nuvem</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <MaterialCommunityIcons name="cloud-upload" size={48} color="#10b981" />
            <Text style={styles.cardTitle}>Arquivos na Nuvem</Text>
            <Text style={styles.cardText}>Gerencie seus documentos</Text>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
