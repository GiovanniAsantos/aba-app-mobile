import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout, Button } from '@/components';
import { styles } from './style';

type TabType = 'minhas' | 'criar';

export default function AssinaturaScreen({ navigation }: NavigationProps<'Assinatura'>) {
  const [activeTab, setActiveTab] = useState<TabType>('minhas');

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="file-sign" size={32} color="#4F6AF5" />
          <Text style={styles.title}>Assinatura Digital</Text>
          <Text style={styles.subtitle}>Gerencie suas assinaturas</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'minhas' && styles.tabActive]}
            onPress={() => setActiveTab('minhas')}
          >
            <MaterialCommunityIcons 
              name="folder-open" 
              size={20} 
              color={activeTab === 'minhas' ? '#4F6AF5' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'minhas' && styles.tabTextActive]}>
              Minhas Assinaturas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'criar' && styles.tabActive]}
            onPress={() => setActiveTab('criar')}
          >
            <MaterialCommunityIcons 
              name="plus-circle" 
              size={20} 
              color={activeTab === 'criar' ? '#4F6AF5' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'criar' && styles.tabTextActive]}>
              Criar Assinatura
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das abas */}
        <ScrollView style={styles.content}>
          {activeTab === 'minhas' ? (
            <MinhasAssinaturas />
          ) : (
            <CriarAssinatura />
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
}

// Componente: Minhas Assinaturas
function MinhasAssinaturas() {
  const assinaturas = [
    { id: 1, titulo: 'Contrato de Prestação de Serviços', status: 'EM_ESPERA', data: '2026-01-08', progresso: 50 },
    { id: 2, titulo: 'Termo de Confidencialidade', status: 'ASSINADO', data: '2026-01-05', progresso: 100 },
    { id: 3, titulo: 'Acordo Comercial', status: 'EM_ESPERA', data: '2026-01-07', progresso: 30 },
    { id: 4, titulo: 'Proposta Técnica', status: 'CANCELADO', data: '2026-01-03', progresso: 0 },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EM_ESPERA':
        return { bg: '#fff3cd', color: '#856404', label: 'Aguardando' };
      case 'ASSINADO':
        return { bg: '#d4edda', color: '#155724', label: 'Assinado' };
      case 'CANCELADO':
        return { bg: '#f8d7da', color: '#721c24', label: 'Cancelado' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', label: 'Desconhecido' };
    }
  };

  return (
    <View style={styles.tabContent}>
      {assinaturas.map((item) => {
        const statusStyle = getStatusStyle(item.status);
        return (
          <View key={item.id} style={styles.assinaturaCard}>
            <View style={styles.assinaturaHeader}>
              <View style={styles.assinaturaInfo}>
                <Text style={styles.assinaturaTitulo}>{item.titulo}</Text>
                <Text style={styles.assinaturaData}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#666" /> {item.data}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>

            {item.progresso > 0 && item.status !== 'CANCELADO' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progresso}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.progresso}%</Text>
              </View>
            )}

            <View style={styles.assinaturaActions}>
              {item.status === 'EM_ESPERA' ? (
                <View style={{ flex: 1 }}>
                  <Button 
                    title="Assinar" 
                    onPress={() => {}} 
                    variant="success"
                  />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Button 
                    title="Visualizar" 
                    onPress={() => {}} 
                    variant="secondary"
                  />
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Componente: Criar Assinatura
function CriarAssinatura() {
  return (
    <View style={styles.tabContent}>
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>1. Selecionar Documento</Text>
        <TouchableOpacity style={styles.uploadCard}>
          <MaterialCommunityIcons name="cloud-upload" size={48} color="#4F6AF5" />
          <Text style={styles.uploadTitle}>Enviar Documento</Text>
          <Text style={styles.uploadSubtitle}>PDF, DOC ou DOCX</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>2. Adicionar Participantes</Text>
        <Button 
          title="Adicionar Signatário" 
          onPress={() => {}} 
          variant="secondary"
        />
      </View>

      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>3. Configurar Assinatura</Text>
        <View style={styles.configCard}>
          <View style={styles.configItem}>
            <MaterialCommunityIcons name="draw" size={24} color="#666" />
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>Tipo de Assinatura</Text>
              <Text style={styles.configSubtitle}>Digital com certificado</Text>
            </View>
          </View>
          <View style={styles.configItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>Ordem de Assinatura</Text>
              <Text style={styles.configSubtitle}>Sequencial</Text>
            </View>
          </View>
        </View>
      </View>

      <Button 
        title="Enviar para Assinatura" 
        onPress={() => {}} 
        variant="primary"
      />
    </View>
  );
}