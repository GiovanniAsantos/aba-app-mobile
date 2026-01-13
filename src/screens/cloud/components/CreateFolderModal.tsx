import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthProvider';
import { apiCloudUrl } from '@/config/api';

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  parentFolderId: number;
  onSuccess: () => void;
}

export default function CreateFolderModal({ visible, onClose, parentFolderId, onSuccess }: CreateFolderModalProps) {
  const { tokens } = useAuth();
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      Alert.alert('Erro', 'Digite um nome para a pasta');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${apiCloudUrl}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          name: folderName,
          parentFolderId: parentFolderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar pasta');
      }

      Alert.alert('Sucesso', 'Pasta criada com sucesso!');
      setFolderName('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      Alert.alert('Erro', 'Falha ao criar pasta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>Nova Pasta</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          <View>
            <Text style={{ marginBottom: 10, fontSize: 14, color: '#374151' }}>Nome da Pasta</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
              }}
              placeholder="Digite o nome da pasta"
              value={folderName}
              onChangeText={setFolderName}
              autoFocus
            />
            
            <TouchableOpacity
              style={{
                backgroundColor: '#4F6AF5',
                padding: 14,
                borderRadius: 8,
                marginTop: 20,
                alignItems: 'center',
              }}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Criar Pasta</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
