import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { EnvironmentInvite } from '@/types/environment';
import { useAuth } from '@/context/AuthProvider';
import { apiAccountUrl } from '@/config/api';
import { styles } from '../style';

export default function RequestAccess() {
  const { tokens } = useAuth();
  const [inviteKey, setInviteKey] = useState('');
  const [inviteTab, setInviteTab] = useState<'sent' | 'received'>('received');
  const [sentInvites, setSentInvites] = useState<EnvironmentInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<EnvironmentInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadInvites();
  }, [inviteTab]);

  const loadInvites = async () => {
    if (!tokens?.accessToken) return;

    setLoading(true);
    try {
      const endpoint = inviteTab === 'sent' ? '/environments/invites/sent' : '/environments/invites/received';
      const response = await fetch(`${apiAccountUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (inviteTab === 'sent') {
          setSentInvites(data.content || []);
        } else {
          setReceivedInvites(data.content || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteKey.trim() || !tokens?.accessToken) return;

    setSending(true);
    try {
      const response = await fetch(`${apiAccountUrl}/environments/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({ environmentKey: inviteKey.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar solicitação');
      }

      Alert.alert('Sucesso', 'Solicitação enviada com sucesso!');
      setInviteKey('');
      loadInvites();
    } catch (error: any) {
      console.error('Erro ao enviar solicitação:', error);
      Alert.alert('Erro', error.message || 'Falha ao enviar solicitação');
    } finally {
      setSending(false);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    Alert.alert('Aceitar Convite', 'Deseja aceitar este convite?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Aceitar',
        onPress: async () => {
          try {
            const response = await fetch(`${apiAccountUrl}/environments/invites/${inviteId}/accept`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${tokens?.accessToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Erro ao aceitar convite');
            }

            Alert.alert('Sucesso', 'Convite aceito com sucesso!');
            loadInvites();
          } catch (error) {
            console.error('Erro ao aceitar convite:', error);
            Alert.alert('Erro', 'Falha ao aceitar convite');
          }
        },
      },
    ]);
  };

  const handleRejectInvite = async (inviteId: number) => {
    Alert.alert('Recusar Convite', 'Deseja recusar este convite?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${apiAccountUrl}/environments/invites/${inviteId}/reject`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${tokens?.accessToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Erro ao recusar convite');
            }

            Alert.alert('Sucesso', 'Convite recusado');
            loadInvites();
          } catch (error) {
            console.error('Erro ao recusar convite:', error);
            Alert.alert('Erro', 'Falha ao recusar convite');
          }
        },
      },
    ]);
  };

  const handleCancelInvite = async (inviteId: number) => {
    Alert.alert('Cancelar Solicitação', 'Deseja cancelar esta solicitação?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${apiAccountUrl}/environments/invites/${inviteId}/cancel`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${tokens?.accessToken}`,
              },
            });

            if (!response.ok) {
              throw new Error('Erro ao cancelar solicitação');
            }

            Alert.alert('Sucesso', 'Solicitação cancelada');
            loadInvites();
          } catch (error) {
            console.error('Erro ao cancelar solicitação:', error);
            Alert.alert('Erro', 'Falha ao cancelar solicitação');
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'ACCEPTED':
        return 'Aceito';
      case 'REJECTED':
        return 'Recusado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const renderInviteCard = (invite: EnvironmentInvite) => {
    const isReceived = inviteTab === 'received';
    const isPending = invite.status === 'PENDING';

    return (
      <View key={invite.id} style={styles.inviteCard}>
        <View style={styles.inviteHeader}>
          <View style={styles.inviteInfo}>
            <Text style={styles.inviteName}>{invite.environmentName}</Text>
            <View style={styles.inviteKeyBox}>
              <Text style={styles.inviteKeyText}>{invite.environmentKey}</Text>
            </View>
          </View>
          <View style={styles.inviteStatusBadge}>
            <MaterialCommunityIcons
              name={isPending ? 'clock-outline' : invite.status === 'ACCEPTED' ? 'check-circle' : 'close-circle'}
              size={12}
              color={isPending ? '#1d4ed8' : invite.status === 'ACCEPTED' ? '#15803d' : '#dc2626'}
            />
            <Text style={styles.inviteStatusText}>{getStatusLabel(invite.status)}</Text>
          </View>
        </View>
        <Text style={styles.inviteDate}>
          {isReceived ? 'Recebido' : 'Enviado'} em {formatDate(invite.sentDate)}
        </Text>

        {isReceived && isPending ? (
          <View style={styles.inviteActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAcceptInvite(invite.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
              <Text style={styles.acceptButtonText}>Aceitar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectInvite(invite.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close-circle" size={16} color="#dc2626" />
              <Text style={styles.rejectButtonText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        ) : !isReceived && isPending ? (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelInvite(invite.id)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="close" size={16} color="#dc2626" />
            <Text style={styles.cancelButtonText}>Cancelar Solicitação</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Associar a um Novo Ambiente</Text>
        <Text style={styles.formDescription}>
          Informe a chave fornecida pelo administrador do ambiente desejado
        </Text>

        <View style={styles.formContent}>
          <Text style={styles.inputLabel}>
            Chave do Ambiente <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="AAAABBBB111222"
            value={inviteKey}
            onChangeText={setInviteKey}
            placeholderTextColor="#9ca3af"
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inviteKey.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendInvite}
            disabled={!inviteKey.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={16} color="#fff" />
                <Text style={styles.sendButtonText}>Enviar Solicitação</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Invites Tabs */}
      <View style={styles.inviteTabsContainer}>
        <View style={styles.inviteTabs}>
          <TouchableOpacity
            style={[styles.inviteTab, inviteTab === 'received' && styles.inviteTabActive]}
            onPress={() => setInviteTab('received')}
            activeOpacity={0.7}
          >
            <Text style={[styles.inviteTabText, inviteTab === 'received' && styles.inviteTabTextActive]}>
              Convites Recebidos ({receivedInvites.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inviteTab, inviteTab === 'sent' && styles.inviteTabActive]}
            onPress={() => setInviteTab('sent')}
            activeOpacity={0.7}
          >
            <Text style={[styles.inviteTabText, inviteTab === 'sent' && styles.inviteTabTextActive]}>
              Solicitações Enviadas ({sentInvites.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inviteTabContent}>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#4F6AF5" />
            </View>
          ) : inviteTab === 'received' ? (
            receivedInvites.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="email-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>Nenhum convite recebido</Text>
              </View>
            ) : (
              receivedInvites.map((invite) => renderInviteCard(invite))
            )
          ) : sentInvites.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="email-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Nenhuma solicitação enviada</Text>
            </View>
          ) : (
            sentInvites.map((invite) => renderInviteCard(invite))
          )}
        </View>
      </View>
    </View>
  );
}
