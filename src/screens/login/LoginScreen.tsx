import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { styles } from './style';

export default function LoginScreen({ navigation }: NavigationProps<'Login'>) {
  const handleLogin = () => {
    try {
      const keycloakUrl = 'http://192.168.80.161:8081/auth/realms/abablockchain/protocol/openid-connect/auth';
      const clientId = 'aba-app-mobile';
      const redirectUri = 'abablockchain://callback';
      
      const authUrl = `${keycloakUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`;
      
      // Abre o navegador externo para autenticação
      Linking.openURL(authUrl).catch((err) => {
        console.error('Erro ao abrir URL:', err);
        Alert.alert('Erro', 'Não foi possível abrir o navegador');
      });
      
      // Navegar para Home (demonstração simples)
      navigation.replace('Home');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login');
    }
  };

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
            <MaterialCommunityIcons name="file-document" size={40} color="#fff" />
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
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="login" size={20} color="#fff" style={styles.loginIcon} />
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.securityText}>Acesso seguro via autenticação externa</Text>
      </View>

      {/* Features no rodapé */}
      <View style={styles.footer}>
        <View style={styles.featuresGrid}>
          <FeatureItem icon="shield-check" label="Seguro" />
          <FeatureItem icon="cloud" label="Nuvem" />
          <FeatureItem icon="workflow" label="BPMS" />
        </View>
      </View>
    </View>
  );
}

function FeatureItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBox}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#4F6AF5" />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}
