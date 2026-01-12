import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input } from '@/components';
import { styles } from './style';
import type { SearchedUser } from '@/types/signature';
import { validate } from 'gerador-validador-cpf';

interface AddParticipantModalProps {
  visible: boolean;
  onClose: () => void;
  onAddInternal: (user: SearchedUser) => void;
  onAddExternal: (data: { nome: string; cpf: string; email: string }) => void;
  onSearchUsers: (text: string) => Promise<SearchedUser[]>;
}

export function AddParticipantModal({
  visible,
  onClose,
  onAddInternal,
  onAddExternal,
  onSearchUsers,
}: AddParticipantModalProps) {
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  // External form
  const [externalName, setExternalName] = useState('');
  const [externalCpf, setExternalCpf] = useState('');
  const [externalEmail, setExternalEmail] = useState('');

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length >= 3) {
      setLoading(true);
      try {
        const results = await onSearchUsers(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        Alert.alert('Erro', 'Não foi possível buscar usuários. Verifique sua conexão.');
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleAddInternal = (user: SearchedUser) => {
    onAddInternal(user);
    resetForm();
    onClose();
  };

  const validateExternalForm = (): boolean => {
    if (!externalName || externalName.length < 3) {
      Alert.alert('Erro', 'Nome muito curto');
      return false;
    }
    if (!externalName.includes(' ')) {
      Alert.alert('Erro', 'Informe nome e sobrenome');
      return false;
    }
    if (!validate(externalCpf)) {
      Alert.alert('Erro', 'CPF inválido');
      return false;
    }
    if (!externalEmail || !externalEmail.includes('@')) {
      Alert.alert('Erro', 'E-mail inválido');
      return false;
    }
    return true;
  };

  const handleAddExternal = () => {
    if (!validateExternalForm()) return;

    onAddExternal({
      nome: externalName,
      cpf: externalCpf,
      email: externalEmail,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSearchText('');
    setSearchResults([]);
    setExternalName('');
    setExternalCpf('');
    setExternalEmail('');
    setActiveTab('internal');
  };

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return text;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Participante</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={{ flexDirection: 'row', marginBottom: 20, gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: activeTab === 'internal' ? '#4F6AF5' : '#f5f5f5',
                }}
                onPress={() => setActiveTab('internal')}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: activeTab === 'internal' ? '#fff' : '#666',
                    fontWeight: '600',
                  }}
                >
                  Interno
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: activeTab === 'external' ? '#4F6AF5' : '#f5f5f5',
                }}
                onPress={() => setActiveTab('external')}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: activeTab === 'external' ? '#fff' : '#666',
                    fontWeight: '600',
                  }}
                >
                  Externo
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
            {activeTab === 'internal' ? (
              <View>
                <Input
                  label="Buscar usuário"
                  value={searchText}
                  onChangeText={handleSearch}
                  placeholder="Nome ou CPF..."
                />

                {loading && (
                  <Text style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
                    Buscando...
                  </Text>
                )}

                {searchResults.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    {searchResults.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          backgroundColor: '#f9f9f9',
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                        onPress={() => handleAddInternal(user)}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#4F6AF5',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '600' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ fontSize: 14, fontWeight: '500' }}>
                            {user.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>
                            {user.numberDocument}
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name="plus-circle"
                          size={24}
                          color="#4F6AF5"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View>
                <View style={{ marginBottom: 12, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
                  <Text style={{ fontSize: 12, color: '#0369a1' }}>
                    💡 Busque ou preencha os dados do participante externo
                  </Text>
                </View>
                
                <Input
                  label="Buscar por nome ou CPF"
                  value={searchText}
                  onChangeText={handleSearch}
                  placeholder="Digite para buscar..."
                />

                {loading && (
                  <Text style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
                    Buscando...
                  </Text>
                )}

                {searchResults.length > 0 && (
                  <View style={{ marginTop: 16, marginBottom: 16 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                      Resultados encontrados:
                    </Text>
                    {searchResults.map((user) => (
                      <TouchableOpacity
                        key={user.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          backgroundColor: '#f9f9f9',
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                        onPress={() => {
                          setExternalName(user.name.split(' - ')[0]);
                          setExternalCpf(formatCPF(user.numberDocument));
                          setExternalEmail(user.email || user.contact || '');
                          setSearchText('');
                          setSearchResults([]);
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#10b981',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '600' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ fontSize: 14, fontWeight: '500' }}>
                            {user.name}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#666' }}>
                            {user.numberDocument}
                          </Text>
                        </View>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={24}
                          color="#10b981"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                <View style={{ marginTop: 16 }}>
                  <Input
                    label="Nome completo"
                    value={externalName}
                    onChangeText={setExternalName}
                    placeholder="Nome e sobrenome"
                  />
                </View>
                <View style={{ marginTop: 16 }}>
                  <Input
                    label="CPF"
                    value={externalCpf}
                    onChangeText={(text) => setExternalCpf(formatCPF(text))}
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ marginTop: 16 }}>
                  <Input
                    label="E-mail"
                    value={externalEmail}
                    onChangeText={setExternalEmail}
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ marginTop: 20 }}>
                  <Button
                    title="Adicionar Participante Externo"
                    onPress={handleAddExternal}
                    variant="primary"
                  />
                </View>
              </View>
            )}
          </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
