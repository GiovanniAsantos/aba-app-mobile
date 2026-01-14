import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import type { BpmsStatusData } from '../../types/bpms';
import { MainLayout } from '@/components';
import { styles } from './style';
import { apiBpmsUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import PageHeader from '@/components/layout/PageHeader';

export default function BPMSScreen({ navigation }: NavigationProps<'BPMS'>) {
  const [pizzaData, setPizzaData] = useState<BpmsStatusData[]>([]);
  const [loadingPizza, setLoadingPizza] = useState(false);
  const { tokens } = useAuth();

  const fetchBpmsGraphicPizza = async () => {
    if (!tokens?.accessToken) return;

    try {
      setLoadingPizza(true);
      console.log('📊 Carregando dados do dashboard BPMS');
      
      const response = await fetch(`${apiBpmsUrlV1}/flows-dashboard-data/status-tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados do dashboard carregados:', data);
      
      if (data?.content) {
        setPizzaData(data.content);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar gráfico de BPMS:', error);
    } finally {
      setLoadingPizza(false);
    }
  };

  useEffect(() => {
    fetchBpmsGraphicPizza();
  }, [tokens?.accessToken]);
  
  const statusColorMap: Record<string, string> = {
    SUCCESS: '#10b981', // Concluídas - verde
    CLOSED: '#ef4444',  // Canceladas - vermelho
    SIGNATURE: '#f59e0b', // Assinaturas - amarelo
    PROCESS: '#4F6AF5', // Em Processo - azul
    NO_EFFECT: '#4F6AF5', // tratar como processo
  };
  const getStatusColor = (key: string) => statusColorMap[key] || '#4F6AF5';
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <PageHeader 
          iconName="sitemap" 
          title="BPMS" 
          subtitle="Gestão de Processos de Negócio" 
          containerStyle={styles.pageHeaderContainer}
          titleStyle={styles.pageHeaderTitle}
          subtitleStyle={styles.pageHeaderSubtitle}
        />

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

            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => navigation.navigate('MinhasAtividades')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="file-document" size={20} color="#4F6AF5" />
              <Text style={styles.secondaryActionButtonText}>Minhas Atividades</Text>
            </TouchableOpacity>
          </View>

          {/* Status das Atividades */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Status das Atividades</Text>
          </View>
          
          <View style={styles.statsGrid}>
            {loadingPizza ? (
              <View style={{ padding: 40, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={{ marginTop: 8, color: '#6b7280' }}>Carregando estatísticas...</Text>
              </View>
            ) : pizzaData.length > 0 ? (
              pizzaData.map((item, index) => {
                const statusIcons: Record<string, string> = {
                  SUCCESS: 'check-circle',
                  CLOSED: 'close-circle',
                  SIGNATURE: 'draw',
                  NO_EFFECT: 'cog',
                  PROCESS: 'cog'
                };
                
                return (
                  <View key={index} style={styles.statCard}>
                    <View style={styles.statIconBox}>
                      <MaterialCommunityIcons 
                        name={(statusIcons[item.statusEnum] || 'cog') as any} 
                        size={24} 
                        color={getStatusColor(item.statusEnum)} 
                      />
                    </View>
                    <Text style={[styles.statValue, { color: getStatusColor(item.statusEnum) }]}>{item.quantity}</Text>
                    <Text style={styles.statLabel}>{item.statusNamePt}</Text>
                  </View>
                );
              })
            ) : (
              <>
                <View style={styles.statCard}>
                  <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
                  </View>
                  <Text style={[styles.statValue, { color: '#10b981' }]}>0</Text>
                  <Text style={styles.statLabel}>Concluídas</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
                  </View>
                  <Text style={[styles.statValue, { color: '#ef4444' }]}>0</Text>
                  <Text style={styles.statLabel}>Canceladas</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name="draw" size={24} color="#f59e0b" />
                  </View>
                  <Text style={[styles.statValue, { color: '#f59e0b' }]}>0</Text>
                  <Text style={styles.statLabel}>Assinaturas</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name="cog" size={24} color="#4F6AF5" />
                  </View>
                  <Text style={[styles.statValue, { color: '#4F6AF5' }]}>0</Text>
                  <Text style={styles.statLabel}>Em Processo</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
