import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { AssociatedEnvironments, RequestAccess } from './components';
import { styles } from './style';
import PageHeader from '@/components/layout/PageHeader';

export default function EnvironmentsScreen({ navigation }: NavigationProps<'Environments'>) {
  const [activeTab, setActiveTab] = useState<'associados' | 'solicitar'>('associados');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.envContainer} showsVerticalScrollIndicator={false}>
        <PageHeader 
          iconName="office-building" 
          title="Ambientes" 
          subtitle="Gerencie seus ambientes" 
          containerStyle={styles.header}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />

        <View style={styles.content}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'associados' && styles.activeTab]}
              onPress={() => setActiveTab('associados')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'associados' && styles.activeTabText]}>
                Meus Ambientes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'solicitar' && styles.activeTab]}
              onPress={() => setActiveTab('solicitar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'solicitar' && styles.activeTabText]}>
                Gerenciar Convites
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.envContent}>
            {activeTab === 'associados' && <AssociatedEnvironments key={`assoc-${refreshKey}`} />}

            {activeTab === 'solicitar' && <RequestAccess key={`req-${refreshKey}`} />}

            <View style={{ height: 40 }} />
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
