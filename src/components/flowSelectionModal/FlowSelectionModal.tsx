import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiBpmsUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import type { BpmsFlow } from '@/types/bpms';
import { styles } from './styles';

interface FlowSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFlow: (flow: BpmsFlow) => void;
}

const FlowSelectionModal: React.FC<FlowSelectionModalProps> = ({
  visible,
  onClose,
  onSelectFlow,
}) => {
  const { tokens } = useAuth();
  const [flows, setFlows] = useState<BpmsFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      loadFlows();
    }
  }, [visible]);

  const loadFlows = async () => {
    if (!tokens?.accessToken) return;

    setLoading(true);

    try {
      const response = await fetch(`${apiBpmsUrlV1}/flows-me/opened-by?pageNumber=0&pageSize=100`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Filtrar apenas fluxos liberados
      const releasedFlows = data.content.filter((f: BpmsFlow) => f.releasedAt && f.releasedAt !== '');
      setFlows(releasedFlows);
    } catch (error) {
      console.error('❌ Erro ao carregar fluxos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os fluxos');
    } finally {
      setLoading(false);
    }
  };

  const filteredFlows = flows.filter((flow) =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFlow = (flow: BpmsFlow) => {
    onSelectFlow(flow);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Selecionar Fluxo</Text>
              <Text style={styles.modalSubtitle}>Escolha um fluxo para criar uma atividade</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar fluxo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Flow List */}
          <ScrollView style={styles.flowList} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={styles.loadingText}>Carregando fluxos...</Text>
              </View>
            ) : filteredFlows.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Nenhum fluxo encontrado' : 'Nenhum fluxo disponível'}
                </Text>
              </View>
            ) : (
              filteredFlows.map((flow) => (
                <TouchableOpacity
                  key={flow.flowId}
                  style={styles.flowCard}
                  onPress={() => handleSelectFlow(flow)}
                  activeOpacity={0.7}
                >
                  <View style={styles.flowIconContainer}>
                    <MaterialCommunityIcons name="sitemap" size={24} color="#4F6AF5" />
                  </View>
                  <View style={styles.flowInfo}>
                    <Text style={styles.flowName} numberOfLines={1}>
                      {flow.name}
                    </Text>
                    {flow.description && (
                      <Text style={styles.flowDescription} numberOfLines={2}>
                        {flow.description}
                      </Text>
                    )}
                    <View style={styles.flowMeta}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#10b981" />
                      <Text style={styles.flowMetaText}>Liberado</Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FlowSelectionModal;
