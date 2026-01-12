import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

interface Environment {
  id: string;
  name: string;
  initials: string;
  apiKey: string;
  status: 'ativo' | 'pendente';
  isCurrent?: boolean;
  logo?: string;
}

interface Invite {
  id: string;
  environmentName: string;
  environmentKey: string;
  sentDate: string;
  status: 'pendente' | 'aceito' | 'recusado';
}

export default function EnvironmentsScreen({ navigation }: NavigationProps<'Environments'>) {
  const [activeTab, setActiveTab] = useState<'meus' | 'associados' | 'solicitar'>('meus');
  const [inviteKey, setInviteKey] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inviteTab, setInviteTab] = useState<'enviados' | 'recebidos'>('enviados');

  // Mock data
  const myEnvironments: Environment[] = [
    {
      id: '1',
      name: 'ABA Teste BaaS 01',
      initials: 'A0',
      apiKey: 'XCYT52VW2eH1',
      status: 'ativo',
    },
    {
      id: '2',
      name: 'Teste 001',
      initials: 'T0',
      apiKey: 'MYI5YR760Q0i',
      status: 'ativo',
    },
    {
      id: '3',
      name: 'Ambiente teste 002',
      initials: 'A0',
      apiKey: 'HOTSEPPRJBWT',
      status: 'pendente',
    },
    {
      id: '4',
      name: 'Ambiente Teste 003',
      initials: 'A0',
      apiKey: 'DWGYAB6UJR9',
      status: 'pendente',
    },
    {
      id: '5',
      name: 'teste2912',
      initials: 'TE',
      apiKey: 'TEQAIZ8QW47',
      status: 'pendente',
    },
  ];

  const associatedEnvironments: Environment[] = [
    {
      id: '10',
      name: 'FYDU TESTE LTDA',
      initials: 'FY',
      apiKey: 'NUJTGNXQJPRV',
      status: 'ativo',
      isCurrent: true,
    },
    {
      id: '11',
      name: 'Parceiro Comercial XYZ',
      initials: 'PC',
      apiKey: 'ABCD1234EFGH',
      status: 'ativo',
    },
    {
      id: '12',
      name: 'Ambiente Colaborativo',
      initials: 'AC',
      apiKey: 'QWERTY123456',
      status: 'ativo',
    },
  ];

  const sentInvites: Invite[] = [
    {
      id: '1',
      environmentName: 'Empresa ABC',
      environmentKey: 'ABC123XYZ',
      sentDate: '10/01/2026',
      status: 'pendente',
    },
  ];

  const receivedInvites: Invite[] = [
    {
      id: '1',
      environmentName: 'Fornecedor Tech',
      environmentKey: 'TECH456DEF',
      sentDate: '09/01/2026',
      status: 'pendente',
    },
  ];

  const handleCopyKey = (id: string, key: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendInvite = () => {
    if (inviteKey.trim()) {
      console.log('Enviando solicitação para:', inviteKey);
      setInviteKey('');
    }
  };

  const renderEnvironmentCard = (env: Environment, isAssociated: boolean = false) => (
    <View
      key={env.id}
      style={[styles.envCard, env.isCurrent && styles.envCardCurrent]}
    >
      <View style={styles.envCardContent}>
        {/* Avatar */}
        <View
          style={[
            styles.envAvatar,
            isAssociated && !env.isCurrent
              ? styles.envAvatarAssociated
              : isAssociated && env.isCurrent
              ? styles.envAvatarCurrent
              : styles.envAvatarDefault,
          ]}
        >
          <Text style={styles.envAvatarText}>{env.initials}</Text>
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
            <View
              style={[
                styles.statusBadge,
                env.status === 'ativo' ? styles.statusBadgeActive : styles.statusBadgePending,
              ]}
            >
              <MaterialCommunityIcons
                name={env.status === 'ativo' ? 'check-circle' : 'clock-outline'}
                size={12}
                color={env.status === 'ativo' ? '#15803d' : '#1d4ed8'}
              />
              <Text
                style={[
                  styles.statusBadgeText,
                  env.status === 'ativo' ? styles.statusBadgeTextActive : styles.statusBadgeTextPending,
                ]}
              >
                {env.status === 'ativo' ? 'Ativo' : 'Pendente'}
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
              onPress={() => handleCopyKey(env.id, env.apiKey)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={copiedId === env.id ? 'check' : 'content-copy'}
                size={14}
                color={copiedId === env.id ? '#16a34a' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={[
              styles.enterButton,
              env.status === 'pendente' && styles.enterButtonDisabled,
              env.isCurrent && styles.enterButtonCurrent,
            ]}
            disabled={env.status === 'pendente' || env.isCurrent}
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

  const renderInviteCard = (invite: Invite, isReceived: boolean = false) => (
    <View key={invite.id} style={styles.inviteCard}>
      <View style={styles.inviteHeader}>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteName}>{invite.environmentName}</Text>
          <View style={styles.inviteKeyBox}>
            <Text style={styles.inviteKeyText}>{invite.environmentKey}</Text>
          </View>
        </View>
        {!isReceived && (
          <View style={styles.inviteStatusBadge}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#1d4ed8" />
            <Text style={styles.inviteStatusText}>Pendente</Text>
          </View>
        )}
      </View>
      <Text style={styles.inviteDate}>{isReceived ? 'Recebido' : 'Enviado'} em {invite.sentDate}</Text>
      {isReceived && (
        <View style={styles.inviteActions}>
          <TouchableOpacity style={styles.acceptButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
            <Text style={styles.acceptButtonText}>Aceitar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="close-circle" size={16} color="#dc2626" />
            <Text style={styles.rejectButtonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.envContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="office-building" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>Ambientes</Text>
              <Text style={styles.subtitle}>Gerencie seus ambientes</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Criar Novo Ambiente</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'meus' && styles.activeTab]}
              onPress={() => setActiveTab('meus')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'meus' && styles.activeTabText]}>
                Meus Ambientes ({myEnvironments.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'associados' && styles.activeTab]}
              onPress={() => setActiveTab('associados')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'associados' && styles.activeTabText]}>
                Ambientes Associados ({associatedEnvironments.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'solicitar' && styles.activeTab]}
              onPress={() => setActiveTab('solicitar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'solicitar' && styles.activeTabText]}>
                Solicitar Acesso
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.envContent}>
          {activeTab === 'meus' && (
            <View style={styles.tabContent}>
              {myEnvironments.map((env) => renderEnvironmentCard(env, false))}
            </View>
          )}

          {activeTab === 'associados' && (
            <View style={styles.tabContent}>
              {associatedEnvironments.map((env) => renderEnvironmentCard(env, true))}
            </View>
          )}

          {activeTab === 'solicitar' && (
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
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, !inviteKey.trim() && styles.sendButtonDisabled]}
                    onPress={handleSendInvite}
                    disabled={!inviteKey.trim()}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="send" size={16} color="#fff" />
                    <Text style={styles.sendButtonText}>Enviar Solicitação</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Invites Tabs */}
              <View style={styles.inviteTabsContainer}>
                <View style={styles.inviteTabs}>
                  <TouchableOpacity
                    style={[styles.inviteTab, inviteTab === 'enviados' && styles.inviteTabActive]}
                    onPress={() => setInviteTab('enviados')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.inviteTabText, inviteTab === 'enviados' && styles.inviteTabTextActive]}>
                      Convites Enviados ({sentInvites.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.inviteTab, inviteTab === 'recebidos' && styles.inviteTabActive]}
                    onPress={() => setInviteTab('recebidos')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.inviteTabText, inviteTab === 'recebidos' && styles.inviteTabTextActive]}>
                      Convites Recebidos ({receivedInvites.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inviteTabContent}>
                  {inviteTab === 'enviados' ? (
                    sentInvites.length === 0 ? (
                      <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="office-building" size={48} color="#d1d5db" />
                        <Text style={styles.emptyStateText}>Não há dados</Text>
                      </View>
                    ) : (
                      sentInvites.map((invite) => renderInviteCard(invite, false))
                    )
                  ) : receivedInvites.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="office-building" size={48} color="#d1d5db" />
                      <Text style={styles.emptyStateText}>Não há dados</Text>
                    </View>
                  ) : (
                    receivedInvites.map((invite) => renderInviteCard(invite, true))
                  )}
                </View>
              </View>
            </View>
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </MainLayout>
  );
}
