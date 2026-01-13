import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthProvider';
import { useUser } from '@/context/UserProvider';
import { apiAccountUrl } from '@/config/api';

interface CreateEnvironmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateEnvironmentModal({ visible, onClose, onSuccess }: CreateEnvironmentModalProps) {
  const { tokens } = useAuth();
  const { refreshUserInfo } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o nome do ambiente');
      return;
    }

    if (!tokens?.accessToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiAccountUrl}/environments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar ambiente');
      }

      Alert.alert('Sucesso', 'Ambiente criado com sucesso!');
      setName('');
      setDescription('');
      await refreshUserInfo(); // Atualizar dados do usuário
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar ambiente:', error);
      Alert.alert('Erro', error.message || 'Falha ao criar ambiente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            width: '90%',
            maxWidth: 500,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#1a1a1a' }}>Criar Novo Ambiente</Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                Preencha as informações do novo ambiente
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Form */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Nome do Ambiente <Text style={{ color: '#dc2626' }}>*</Text>
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#1a1a1a',
                }}
                placeholder="Ex: Empresa XYZ"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Descrição (Opcional)
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  color: '#1a1a1a',
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
                placeholder="Descreva o ambiente..."
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                editable={!loading}
              />
            </View>

            {/* Info Card */}
            <View
              style={{
                backgroundColor: '#eff6ff',
                borderRadius: 8,
                padding: 14,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: '#bae6fd',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <MaterialCommunityIcons name="information" size={20} color="#0ea5e9" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: '#0369a1', flex: 1, lineHeight: 18 }}>
                  Após criar o ambiente, você receberá uma chave de API que poderá compartilhar com outros usuários para
                  convidá-los.
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#4F6AF5',
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: !name.trim() || loading ? 0.5 : 1,
                }}
                onPress={handleCreate}
                disabled={!name.trim() || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Criar Ambiente</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#f3f4f6',
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleClose}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#374151', fontSize: 16, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
