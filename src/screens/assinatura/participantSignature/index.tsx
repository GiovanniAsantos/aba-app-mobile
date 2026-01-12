import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { Button, Input, Select } from '@/components';
import { styles } from './style';
import { apiSignatureUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import type { ParticipantSignatureResponse, ParticipantSignature } from '@/types/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ParticipantSignatureTab = () => {
  const { tokens } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [signatures, setSignatures] = useState<ParticipantSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 5,
    totalRecords: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const statusOptions = [
    { label: 'Todos os Status', value: '' },
    { label: 'Concluído', value: 'CONCLUIDO' },
    { label: 'Aguardando', value: 'EM_ESPERA' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ];

  const getParticipantSignatures = async (page: number = 0) => {
    if (!tokens?.accessToken) {
      Alert.alert('Erro', 'Token de acesso não encontrado');
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: '5',
        page: page.toString(),
        initialDate: '',
        finalDate: '',
        status: statusFilter,
      });

      const url = `${apiSignatureUrlV1}/signatures/me/participant?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: ParticipantSignatureResponse = await response.json();

      setSignatures(data.content);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalRecords: data.totalRecords,
        totalPages: data.totalPages,
        hasPreviousPage: data.hasPreviousPage,
        hasNextPage: data.hasNextPage,
      });
    } catch (error: any) {
      console.error('Erro ao buscar assinaturas:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar as assinaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getParticipantSignatures(0);
  }, [statusFilter]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return { bg: '#d4edda', color: '#155724', label: 'Concluído' };
      case 'EM_ESPERA':
        return { bg: '#fff3cd', color: '#856404', label: 'Aguardando' };
      case 'CANCELADO':
        return { bg: '#f8d7da', color: '#721c24', label: 'Cancelado' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', label: status };
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      getParticipantSignatures(pagination.pageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage || pagination.pageNumber > 0) {
      getParticipantSignatures(pagination.pageNumber - 1);
    }
  };

  // Filtrar assinaturas localmente pela busca
  const filteredSignatures = signatures.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase()) ||
    item.createdBy.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading && signatures.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#4F6AF5" />
        <Text style={{ marginTop: 16, color: '#666' }}>Carregando assinaturas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.tabContent}>
      {/* Filtros */}
      <View style={{ marginBottom: 16 }}>
        <Input
          label="Buscar"
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por título ou criador..."
          leftIcon="magnify"
        />
        
        <View style={{ marginTop: 12 }}>
          <Select
            label="Filtrar por Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(String(value))}
            options={statusOptions}
          />
        </View>
      </View>

      {/* Lista de assinaturas */}
      {!loading && filteredSignatures.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
          <Text style={{ marginTop: 16, color: '#666', textAlign: 'center' }}>
            {searchText || statusFilter ? 'Nenhuma assinatura encontrada com os filtros aplicados' : 'Nenhuma assinatura encontrada'}
          </Text>
        </View>
      ) : (
        <>
          {filteredSignatures.map((item) => {
        const statusStyle = getStatusStyle(item.statusParticipant);
        return (
          <View key={item.id} style={styles.assinaturaCard}>
            <View style={styles.assinaturaHeader}>
              <View style={styles.assinaturaInfo}>
                <Text style={styles.assinaturaTitulo}>{item.title}</Text>
                <Text style={styles.assinaturaData}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#666" /> {item.createAt}
                </Text>
                <Text style={styles.assinaturaData}>
                  <MaterialCommunityIcons name="account" size={14} color="#666" /> {item.createdBy}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>

            {/* Progresso */}
            {item.percentage > 0 && item.statusParticipant !== 'CANCELADO' && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.percentage}%` }]} />
                </View>
                <Text style={styles.progressText}>{item.percentage}%</Text>
              </View>
            )}

            {/* Informações adicionais */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 12 }}>
              <Text style={{ fontSize: 12, color: '#666' }}>
                📊 {item.amountSigned}/{item.amountParticipants} assinaturas
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>
                📄 {item.documentsToSign.length} documento(s)
              </Text>
            </View>

            {/* Status do CRD */}
            {item.crdInfo && (
              <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  <MaterialCommunityIcons name="link-variant" size={12} color="#666" /> 
                  Blockchain: {item.crdInfo.status}
                </Text>
              </View>
            )}

            {/* Ações */}
            <View style={styles.assinaturaActions}>
              {item.statusParticipant === 'EM_ESPERA' ? (
                <View style={{ flex: 1 }}>
                  <Button
                    title="Assinar"
                    onPress={() => navigation.navigate('Signature', { signatureId: item.id.toString() })}
                    variant="success"
                  />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Button
                    title="Visualizar"
                    onPress={() => navigation.navigate('Signature', { signatureId: item.id.toString() })}
                    variant="secondary"
                  />
                </View>
              )}
            </View>
          </View>
        );
      })}

      {/* Paginação */}
      {(pagination.pageNumber > 0 || pagination.hasNextPage) && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 16, gap: 12 }}>
          <Button
            title="Anterior"
            onPress={handlePreviousPage}
            variant="secondary"
            disabled={pagination.pageNumber === 0 || loading}
            loading={loading}
          />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#666', fontSize: 14 }}>
              Página {pagination.pageNumber + 1} de {pagination.totalPages}
            </Text>
            <Text style={{ color: '#999', fontSize: 12 }}>
              Total: {pagination.totalRecords} registros
            </Text>
          </View>
          <Button
            title="Próximo"
            onPress={handleNextPage}
            variant="secondary"
            disabled={!pagination.hasNextPage || loading}
            loading={loading}
          />
        </View>
      )}
        </>
      )}
    </ScrollView>
  );
};

export default ParticipantSignatureTab;
