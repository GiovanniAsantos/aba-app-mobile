import { Button } from '@/components';
import { useAuth } from '@/context/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Text,
  View
} from 'react-native';
import type { NavigationProps } from '../../types/navigation';
import { styles } from './style';

export default function LoginScreen({ navigation }: NavigationProps<'Login'>) {
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Se já estiver autenticado, redirecionar para Home
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated, navigation]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Background decorativo */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.mainContent}>
        {/* Logo e marca */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>ABA</Text>
          </View>
          <Text style={styles.brandName}>Aba Blockchain</Text>
          <Text style={styles.brandTagline}>Segurança e Inovação</Text>
        </View>

        {/* Título principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            Gerencie processos e documentos com inteligência
          </Text>
          <Text style={styles.mainSubtitle}>
            Automatize fluxos, assine digitalmente e armazene com segurança total na nuvem.
          </Text>
        </View>


        <Button title='Entrar' onPress={login} variant='primary' />

        <Text style={styles.securityText}>Acesso seguro via autenticação externa</Text>
      </View>

      {/* Features no rodapé */}
      <View style={styles.footer}>
        <View style={styles.featuresGrid}>
          <FeatureItem label="Seguro" />
          <FeatureItem label="Nuvem" />
          <FeatureItem label="BPMS" />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBox}>
        <Text style={styles.featureIcon}>✓</Text>
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}
