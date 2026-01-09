import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NavigationProps } from '../../types/navigation';
import { Button } from '@/components';
import { useAuth } from '@/context/AuthProvider';

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

        {/* Botão de entrada */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={login}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Entrar com Keycloak</Text>
        </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.1,
  },
  blob1: {
    width: 320,
    height: 320,
    backgroundColor: '#4F6AF5',
    top: -96,
    right: -96,
  },
  blob2: {
    width: 256,
    height: 256,
    backgroundColor: '#6366f1',
    top: '50%',
    left: -128,
  },
  blob3: {
    width: 288,
    height: 288,
    backgroundColor: '#4F6AF5',
    bottom: -64,
    right: '25%',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#4F6AF5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4F6AF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  brandName: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  brandTagline: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 48,
    maxWidth: 320,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F6AF5',
    width: '100%',
    maxWidth: 320,
    height: 56,
    borderRadius: 12,
    shadowColor: '#4F6AF5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  loginIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
    zIndex: 10,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: 320,
    marginHorizontal: 'auto',
    justifyContent: 'center',
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(79, 106, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    color: '#4F6AF5',
    fontWeight: 'bold',
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
