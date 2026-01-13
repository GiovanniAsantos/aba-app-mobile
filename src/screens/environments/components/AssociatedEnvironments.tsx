import { apiAccountUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import { useUser } from '@/context/UserProvider';
import type { Environment } from '@/types/environment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../style';

export default function AssociatedEnvironments() {
  const navigation = useNavigation();
  const { tokens } = useAuth();
  const { userInfo, loading: userLoading, refreshUserInfo } = useUser();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  // Mapear dados do UserInfo para o formato do componente
  const environments: Environment[] = (userInfo?.associatedEnvironments || []).map((env) => ({
    id: 0, // Não usado
    name: env.name,
    initials: env.nameInit,
    apiKey: env.key,
    status: env.status,
    isCurrent: userInfo?.selectedEnvironments?.key === env.key,
    logo: env.photos?.find(p => p.typePhoto === 'LOGO_SMALL' || p.typePhoto === 'LOGO_LARGE')?.path,
  }));

  const loading = userLoading;

  const handleSwitchEnvironment = async (apiKey: string) => {
    Alert.alert(
      'Trocar Ambiente',
      'Deseja trocar para este ambiente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setSwitching(true);
            try {
              const response = await fetch(`${apiAccountUrlV1}/environments/${apiKey}/change-current-env`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokens?.accessToken}`,
                },
              });

              if (!response.ok) {
                throw new Error('Erro ao trocar ambiente');
              }

              // Atualizar dados do usuário
              await refreshUserInfo();
              
              // Redirecionar para Home
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' as never }],
              });
              
              Alert.alert('Sucesso', 'Ambiente alterado com sucesso!');
            } catch (error) {
              console.error('Erro ao trocar ambiente:', error);
              Alert.alert('Erro', 'Falha ao trocar de ambiente');
            } finally {
              setSwitching(false);
            }
          },
        },
      ]
    );
  };

  const handleCopyKey = (key: string) => {
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || switching) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F6AF5" />
        <Text style={{ marginTop: 12, color: '#6b7280' }}>
          {switching ? 'Trocando ambiente...' : 'Carregando...'}
        </Text>
      </View>
    );
  }

  if (environments.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="office-building" size={64} color="#d1d5db" />
        <Text style={styles.emptyStateText}>Nenhum ambiente associado</Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }}>
          Use a aba "Solicitar Acesso" para se associar a outros ambientes
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {environments.map((env) => (
        <View key={env.apiKey} style={[styles.envCard, env.isCurrent && styles.envCardCurrent]}>
          <View style={styles.envCardContent}>
            {/* Avatar */}
            <View
              style={[
                styles.envAvatar,
                env.isCurrent ? styles.envAvatarCurrent : styles.envAvatarAssociated,
              ]}
            >
              <Text style={styles.envAvatarText}>
                {env.initials || env.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>

            {/* Content */}
            <View style={styles.envInfo}>
              <View style={styles.envHeader}>
                <View style={styles.envTitleContainer}>
                  <Text style={styles.envName} numberOfLines={1}>
                    {env.name}
                  </Text>
                  {env.isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Atual</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, styles.statusBadgeActive]}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#15803d" />
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextActive]}>Ativo</Text>
                </View>
              </View>

              {/* API Key */}
              <View style={styles.apiKeyContainer}>
                <View style={styles.apiKeyBox}>
                  <Text style={styles.apiKeyText}>{env.apiKey}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => handleCopyKey(env.apiKey)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={copiedId === env.apiKey ? 'check' : 'content-copy'}
                    size={14}
                    color={copiedId === env.apiKey ? '#16a34a' : '#9ca3af'}
                  />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={[styles.enterButton, env.isCurrent && styles.enterButtonCurrent]}
                disabled={env.isCurrent || switching}
                onPress={() => handleSwitchEnvironment(env.apiKey)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="login" size={16} color={env.isCurrent ? '#4F6AF5' : '#fff'} />
                <Text style={[styles.enterButtonText, env.isCurrent && styles.enterButtonTextCurrent]}>
                  {env.isCurrent ? 'Ambiente Atual' : 'Entrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
