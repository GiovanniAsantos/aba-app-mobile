import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Environment } from '@/types/environment';
import { useAuth } from '@/context/AuthProvider';
import { useUser } from '@/context/UserProvider';
import { apiAccountUrl } from '@/config/api';
import { styles } from '../style';

interface MyEnvironmentsProps {
  onCreatePress: () => void;
}

export default function MyEnvironments({ onCreatePress }: MyEnvironmentsProps) {
  const { tokens } = useAuth();
  const { userInfo, loading: userLoading, refreshUserInfo } = useUser();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mapear dados do UserInfo para o formato do componente
  const environments: Environment[] = (userInfo?.myEnvironments || []).map((env) => ({
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
            'Deseja trocar para este ambiente? O aplicativo será recarregado.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${apiAccountUrl}/environments/switch`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${tokens?.accessToken}`,
                                },
                                body: JSON.stringify({ environmentKey: apiKey }),
                            });

                            if (!response.ok) {
                                throw new Error('Erro ao trocar ambiente');
                            }

                            Alert.alert('Sucesso', 'Ambiente alterado! Por favor, feche e abra o aplicativo novamente para aplicar as mudanças.');
                        } catch (error) {
                            console.error('Erro ao trocar ambiente:', error);
                            Alert.alert('Erro', 'Falha ao trocar de ambiente');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: '#dcfce7', text: '#15803d', icon: 'check-circle' };
      case 'PENDING':
        return { bg: '#dbeafe', text: '#1d4ed8', icon: 'clock-outline' };
      case 'SUSPENDED':
        return { bg: '#fee2e2', text: '#dc2626', icon: 'alert-circle' };
      case 'DELETED':
        return { bg: '#f3f4f6', text: '#6b7280', icon: 'delete' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', icon: 'help-circle' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'PENDING':
        return 'Pendente';
      case 'SUSPENDED':
        return 'Suspenso';
      case 'DELETED':
        return 'Excluído';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F6AF5" />
        <Text style={{ marginTop: 12, color: '#6b7280' }}>Carregando...</Text>
      </View>
    );
  }

  if (environments.length === 0) {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="office-building" size={64} color="#d1d5db" />
        <Text style={styles.emptyStateText}>Nenhum ambiente encontrado</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreatePress} activeOpacity={0.8}>
          <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Criar Primeiro Ambiente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {environments.map((env) => {
        const statusConfig = getStatusColor(env.status);
        return (
          <View key={env.apiKey} style={[styles.envCard, env.isCurrent && styles.envCardCurrent]}>
            <View style={styles.envCardContent}>
              {/* Avatar */}
              <View style={[styles.envAvatar, styles.envAvatarDefault]}>
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
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <MaterialCommunityIcons name={statusConfig.icon as any} size={12} color={statusConfig.text} />
                    <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                      {getStatusLabel(env.status)}
                    </Text>
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
                  style={[
                    styles.enterButton,
                    env.status !== 'ACTIVE' && styles.enterButtonDisabled,
                    env.isCurrent && styles.enterButtonCurrent,
                  ]}
                  disabled={env.status !== 'ACTIVE' || env.isCurrent}
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
        );
      })}
    </View>
  );
}
