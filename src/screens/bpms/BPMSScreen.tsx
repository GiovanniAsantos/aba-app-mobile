import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

export default function BPMSScreen({ navigation }: NavigationProps<'BPMS'>) {
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="sitemap" size={32} color="#4F6AF5" />
          <Text style={styles.title}>BPMS</Text>
          <Text style={styles.subtitle}>Gestão de Processos de Negócio</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <MaterialCommunityIcons name="cog-outline" size={48} color="#8b5cf6" />
            <Text style={styles.cardTitle}>Processos</Text>
            <Text style={styles.cardText}>Automatize e gerencie processos</Text>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
