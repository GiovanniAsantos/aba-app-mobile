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
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {userInfo?.name}!</Text>
          <Text style={styles.subtitle}>Bem-vindo ao Aba Blockchain</Text>
          {userInfo?.contact && (
            <Text style={styles.userEmail}>{userInfo.contact}</Text>
          )}
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cloud')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="upload" size={28} color="#4F6AF5" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Salvar Documento</Text>
              <Text style={styles.actionDescription}>
                Faça upload de um novo documento para a nuvem
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Assinatura')}
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cloud')}
            activeOpacity={0.7}
          >
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
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('BPMS')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="transit-connection-variant" size={28} color="#8b5cf6" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Criar Atividade</Text>
              <Text style={styles.actionDescription}>
                Adicione uma nova atividade aos seus fluxos
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
