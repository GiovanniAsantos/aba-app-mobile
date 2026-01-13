import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';
import { useUser } from '@/context/UserProvider';

export default function HomeScreen({ navigation }: NavigationProps<'Home'>) {
  const { userInfo, loading } = useUser();

  const bpmsService = userInfo?.selectedEnvironments?.services.find(
    (s) => s.typeProduct === "ALLOW_MODULE_BPMS"
  );
  const signatureService = userInfo?.selectedEnvironments?.services.find(
    (s) => s.typeProduct === "ALLOW_MODULE_SIGNATURE"
  );
  const cloudService = userInfo?.selectedEnvironments?.services.find(
    (s) => s.typeProduct === "ALLOW_MODULE_CLOUD"
  );

  const hasBPMS = bpmsService?.permissions?.length! > 0;
  const hasSignature = signatureService?.permissions?.length! > 0;
  const hasCloud = cloudService?.permissions?.length! > 0;

  const bpmsIsActive = bpmsService?.active === true;
  const signatureIsActive = signatureService?.active === true;
  const cloudIsActive = cloudService?.active === true;

  if (loading) {
    return (
      <MainLayout navigation={navigation}>
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4F6AF5" />
          <Text style={{ marginTop: 16, color: '#666' }}>Carregando...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header com gradiente */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Olá, {userInfo?.name || 'Usuário'}! 👋</Text>
              <Text style={styles.subtitle}>Bem-vindo ao Aba Blockchain</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => { }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="bell-outline" size={24} color="#1a1a1a" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {userInfo?.selectedEnvironments && (
            <View style={styles.environmentBadge}>
              <MaterialCommunityIcons name="server" size={16} color="#4F6AF5" />
              <Text style={styles.environmentText}>
                {userInfo.selectedEnvironments.name}
              </Text>
            </View>
          )}
        </View>

        {/* Cards de estatísticas em grid */}
        <View style={styles.statsGrid}>
          {hasBPMS && (
            bpmsIsActive ?
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => navigation.navigate('BPMS')}
                activeOpacity={0.7}
              >
                <View style={styles.statIconBox}>
                  <MaterialCommunityIcons name="cog-outline" size={24} color="#8b5cf6" />
                </View>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>BPMS</Text>
              </TouchableOpacity> : (
                <View style={styles.statCardInactive}>
                  <MaterialCommunityIcons name="cog-outline" size={24} color="#ccc" />
                  <Text style={styles.statValueInactive}>Inativo</Text>
                  <Text style={styles.statLabelInactive}>BPMS</Text>
                </View>
              )
          )}

          {
            hasSignature && (
              signatureIsActive ? (
                <TouchableOpacity
                  style={styles.statCard}
                  onPress={() => navigation.navigate('Assinatura')}
                  activeOpacity={0.7}
                >
                  <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name="file-document" size={24} color="#4F6AF5" />
                  </View>
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Assinatura</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.statCardInactive}>
                  <MaterialCommunityIcons name="file-document" size={24} color="#ccc" />
                  <Text style={styles.statValueInactive}>Inativo</Text>
                  <Text style={styles.statLabelInactive}>Assinatura</Text>
                </View>
              )
            )
          }

          {
            hasCloud && (
              cloudIsActive ? (
                <TouchableOpacity
                  style={styles.statCard}
                  onPress={() => navigation.navigate('Cloud')}
                  activeOpacity={0.7}
                >
                  <View style={styles.statIconBox}>
                    <MaterialCommunityIcons name="cloud-check" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Cloud</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.statCardInactive}>
                  <MaterialCommunityIcons name="file-document" size={24} color="#ccc" />
                  <Text style={styles.statValueInactive}>Inativo</Text>
                  <Text style={styles.statLabelInactive}>Cloud</Text>
                </View>
              )
            )
          }
        </View>

        {/* Resumo de atividades recentes */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades Recentes</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIconContainer}>
              <MaterialCommunityIcons name="file-check" size={20} color="#10b981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Documento assinado</Text>
              <Text style={styles.activityDescription}>Contrato_2024.pdf</Text>
              <Text style={styles.activityTime}>Há 2 horas</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityIconContainer, { backgroundColor: '#eff6ff' }]}>
              <MaterialCommunityIcons name="cloud-upload" size={20} color="#4F6AF5" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Upload realizado</Text>
              <Text style={styles.activityDescription}>Relatório_Janeiro.pdf</Text>
              <Text style={styles.activityTime}>Ontem</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={[styles.activityIconContainer, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="cog-sync" size={20} color="#f59e0b" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Fluxo iniciado</Text>
              <Text style={styles.activityDescription}>Aprovação de documento</Text>
              <Text style={styles.activityTime}>Há 3 dias</Text>
            </View>
          </View>
        </View> */}

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <View style={styles.quickActionsGrid}>
            {hasCloud && (
              cloudIsActive ?
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Cloud')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#eff6ff' }]}>
                    <MaterialCommunityIcons name="upload" size={28} color="#4F6AF5" />
                  </View>
                  <Text style={styles.quickActionTitle}>Upload</Text>
                </TouchableOpacity> : <View style={styles.statCardInactive}>
                  <MaterialCommunityIcons name="file-document" size={24} color="#ccc" />
                  <Text style={styles.statValueInactive}>Inativo</Text>
                  <Text style={styles.statLabelInactive}>Cloud</Text>
                </View>)}

            {hasCloud && (
              cloudIsActive ? <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('Cloud')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
                  <MaterialCommunityIcons name="folder-open" size={28} color="#f59e0b" />
                </View>
                <Text style={styles.quickActionTitle}>Arquivos</Text>
              </TouchableOpacity> : <View style={styles.statCardInactive}>
                <MaterialCommunityIcons name="file-document" size={24} color="#ccc" />
                <Text style={styles.statValueInactive}>Inativo</Text>
                <Text style={styles.statLabelInactive}>Cloud</Text>
              </View>)}

            {
              hasSignature && (
                signatureIsActive ? (<TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Assinatura')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialCommunityIcons name="file-sign" size={28} color="#10b981" />
                  </View>
                  <Text style={styles.quickActionTitle}>Assinar</Text>
                </TouchableOpacity>) : (<View style={styles.statCardInactive}>
                  <MaterialCommunityIcons name="file-document" size={24} color="#ccc" />
                  <Text style={styles.statValueInactive}>Inativo</Text></View>)
              )}

            {hasBPMS && (
              bpmsIsActive ? <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => navigation.navigate('BPMS')}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#f5f3ff' }]}>
                  <MaterialCommunityIcons name="plus-circle" size={28} color="#8b5cf6" />
                </View>
                <Text style={styles.quickActionTitle}>Nova Task</Text>
              </TouchableOpacity> : (
                <View style={styles.statCardInactive}>
                  <MaterialCommunityIcons name="cog-outline" size={24} color="#ccc" />
                  <Text style={styles.statValueInactive}>Inativo</Text>
                  <Text style={styles.statLabelInactive}>BPMS</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Card informativo */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#4F6AF5" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Blockchain Seguro</Text>
            <Text style={styles.infoText}>
              Nosso processo de assinatura é protegido com tecnologia blockchain
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </MainLayout>
  );
}
