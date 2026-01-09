import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';

export default function HomeScreen({ navigation }: NavigationProps<'Home'>) {
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Bem-vindo ao Aba Blockchain</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="file-document" size={24} color="#4F6AF5" />
            </View>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Documentos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="cloud-check" size={24} color="#10b981" />
            </View>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Na Nuvem</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="pen" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Assinados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <MaterialCommunityIcons name="cog-outline" size={24} color="#8b5cf6" />
            </View>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Processos</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="upload" size={28} color="#4F6AF5" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Enviar Documento</Text>
              <Text style={styles.actionDescription}>
                Faça upload de um novo documento para a nuvem
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </View>

          <View style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="file-sign" size={28} color="#10b981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Assinar Documento</Text>
              <Text style={styles.actionDescription}>
                Adicione sua assinatura digital
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </View>

          <View style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="folder-open" size={28} color="#f59e0b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Meus Arquivos</Text>
              <Text style={styles.actionDescription}>
                Acesse todos os seus documentos
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#4F6AF5" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Layout com Menu Inferior</Text>
            <Text style={styles.infoText}>
              Toque no botão central da barra inferior para abrir o menu de navegação
            </Text>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 106, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 100,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#3b82f6',
    lineHeight: 18,
  },
});
