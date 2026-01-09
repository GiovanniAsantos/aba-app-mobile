import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

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
