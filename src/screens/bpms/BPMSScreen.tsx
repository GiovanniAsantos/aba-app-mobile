import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout, Button } from '@/components';
import { styles } from './style';

export default function BPMSScreen({ navigation }: NavigationProps<'BPMS'>) {
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="sitemap" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>BPMS</Text>
              <Text style={styles.subtitle}>Gestão de Processos de Negócio</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Feature Cards Grid */}
          <View style={styles.cardsGrid}>
            {/* Processos Card */}
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name="cog-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>Processos</Text>
              <Text style={styles.featureDescription}>
                Automatize e gerencie processos de forma eficiente
              </Text>
              <View style={styles.featureStats}>
                <MaterialCommunityIcons name="pulse" size={16} color="#666" />
                <Text style={styles.featureStatsText}>12 processos ativos</Text>
              </View>
            </View>

            {/* Equipe Card */}
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name="account-group" size={24} color="#fff" />
              </View>
              <Text style={styles.featureTitle}>Equipe</Text>
              <Text style={styles.featureDescription}>
                Colaboração e gestão de membros do time
              </Text>
              <View style={styles.featureStats}>
                <MaterialCommunityIcons name="account-group" size={16} color="#666" />
                <Text style={styles.featureStatsText}>24 membros ativos</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.navigate('Fluxos')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="file-document" size={20} color="#fff" />
              <Text style={styles.primaryActionButtonText}>Fluxos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => navigation.navigate('MinhasAtividades')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="code-braces" size={20} color="#4F6AF5" />
              <Text style={styles.secondaryActionButtonText}>Minhas Atividades</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>48</Text>
              <Text style={styles.statLabel}>Tarefas Hoje</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#8b5cf6' }]}>12</Text>
              <Text style={styles.statLabel}>Em Progresso</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>36</Text>
              <Text style={styles.statLabel}>Concluídas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#8b5cf6' }]}>95%</Text>
              <Text style={styles.statLabel}>Eficiência</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
