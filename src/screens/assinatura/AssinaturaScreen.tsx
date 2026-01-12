import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout, Button } from '@/components';
import { styles } from './style';
import ParticipantSignatureTab from './participantSignature';
import AllSignatureTab from './allSignature';
import CreateSignature from './createSignature';

type TabType = 'participante' | 'criar' | 'todas';

export default function AssinaturaScreen({ navigation }: NavigationProps<'Assinatura'>) {
  const [activeTab, setActiveTab] = useState<TabType>('participante');

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
            style={[styles.tab, activeTab === 'participante' && styles.tabActive]}
            onPress={() => setActiveTab('participante')}
          >
            <MaterialCommunityIcons 
              name="folder-open" 
              size={20} 
              color={activeTab === 'participante' ? '#4F6AF5' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'participante' && styles.tabTextActive]}>
              Participante
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'todas' && styles.tabActive]}
            onPress={() => setActiveTab('todas')}
          >
            <MaterialCommunityIcons 
              name="folder-open" 
              size={20} 
              color={activeTab === 'todas' ? '#4F6AF5' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'todas' && styles.tabTextActive]}>
              Todas
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
              Criar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo das abas */}
        <ScrollView style={styles.content}>
          {activeTab === 'participante' ? (
            <ParticipantSignatureTab />
          ) : activeTab === 'todas' ? (
            <AllSignatureTab />
          ) : (
            <CreateSignature />
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
}