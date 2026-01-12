import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { Button } from '@/components';
import { useAuth } from '@/context/AuthProvider';
import { apiSignatureUrlV1 } from '@/config/api';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  participantEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 12,
    color: '#4F6AF5',
    fontWeight: '500',
  },
  participantStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  participantStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  showMoreButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F6AF5',
  },
  actionSection: {
    margin: 16,
    marginTop: 8,
  },
});

type SignatureScreenRouteProp = RouteProp<RootStackParamList, 'Signature'>;
type SignatureScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signature'
>;

interface SignatureProps {
  route: SignatureScreenRouteProp;
  navigation: SignatureScreenNavigationProp;
}

interface SignatureData {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  documents: Array<{
    id: string;
    name: string;
    url?: string;
  }>;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    cpf: string;
    status: string;
    titleParticipant: string;
    signedAt?: string;
  }>;
  groups: Array<{
    sequence: number;
    ruleId: number | null;
    participants: Array<any>;
  }>;
  currentUserCanSign: boolean;
  currentUserStatus: string;
}

export default function SignatureScreen({ route, navigation }: SignatureProps) {
  const { tokens } = useAuth();
  const { signatureId } = route.params;
  const [loading, setLoading] = useState(true);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  useEffect(() => {
    loadSignatureData();
  }, [signatureId]);

  const loadSignatureData = async () => {
    try {
      const response = await fetch(
        `${apiSignatureUrlV1}/signatures/${signatureId}`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar dados da assinatura');
      }

      const data = await response.json();
      setSignatureData(data);
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da assinatura');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return { bg: '#d4edda', color: '#155724', label: 'Concluído' };
      case 'EM_ESPERA':
        return { bg: '#fff3cd', color: '#856404', label: 'Aguardando' };
      case 'CANCELADO':
        return { bg: '#f8d7da', color: '#721c24', label: 'Cancelado' };
      case 'ASSINADO_POR_TODOS':
        return { bg: '#d4edda', color: '#155724', label: 'Assinado por Todos' };
      case 'FINALIZADO':
        return { bg: '#d1ecf1', color: '#0c5460', label: 'Finalizado' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', label: status };
    }
  };

  const handleSign = () => {
    navigation.navigate('SignDocument', { signatureId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6AF5" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!signatureData) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.errorText}>Assinatura não encontrada</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} variant="secondary" />
      </View>
    );
  }

  const statusStyle = getStatusStyle(signatureData.status);
  const participantsToShow = showAllParticipants
    ? signatureData.participants
    : signatureData.participants.slice(0, 5);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Assinatura</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Título e Status */}
      <View style={styles.section}>
        <Text style={styles.title}>{signatureData.title}</Text>
        {signatureData.description && (
          <Text style={styles.description}>{signatureData.description}</Text>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Informações */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <Text style={styles.infoText}>
            Criado em: {new Date(signatureData.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={20} color="#666" />
          <Text style={styles.infoText}>Criado por: {signatureData.createdBy}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="file-document" size={20} color="#666" />
          <Text style={styles.infoText}>
            {signatureData.documents.length} documento(s)
          </Text>
        </View>
      </View>

      {/* Documentos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos</Text>
        {signatureData.documents.map((doc, index) => (
          <View key={doc.id} style={styles.documentCard}>
            <MaterialCommunityIcons name="file-pdf-box" size={32} color="#f44336" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.documentName}>{doc.name}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Participantes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Participantes ({signatureData.participants.length})
        </Text>
        {participantsToShow.map((participant) => {
          const participantStatus = getStatusStyle(participant.status);
          return (
            <View key={participant.id} style={styles.participantCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <Text style={styles.participantEmail}>{participant.email}</Text>
                <Text style={styles.participantRole}>
                  {participant.titleParticipant === 'SIGNATARIO'
                    ? 'Signatário'
                    : participant.titleParticipant}
                </Text>
              </View>
              <View
                style={[
                  styles.participantStatusBadge,
                  { backgroundColor: participantStatus.bg },
                ]}
              >
                <Text style={[styles.participantStatusText, { color: participantStatus.color }]}>
                  {participantStatus.label}
                </Text>
              </View>
            </View>
          );
        })}

        {signatureData.participants.length > 5 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllParticipants(!showAllParticipants)}
          >
            <Text style={styles.showMoreText}>
              {showAllParticipants ? 'Ver menos' : `Ver todos (${signatureData.participants.length})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botão Assinar */}
      {signatureData.currentUserCanSign && signatureData.currentUserStatus === 'EM_ESPERA' && (
        <View style={styles.actionSection}>
          <Button
            title="Assinar Documento"
            onPress={handleSign}
            variant="primary"
          />
        </View>
      )}

      {/* Botão Voltar */}
      <View style={styles.actionSection}>
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}
