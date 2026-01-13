import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CloudItem, CloudFolder } from '@/types/cloud';
import { isCloudFolder } from '@/types/cloud';
import { useAuth } from '@/context/AuthProvider';
import { apiCloudUrl } from '@/config/api';

interface MoveModalProps {
  visible: boolean;
  onClose: () => void;
  item: CloudItem | null;
  currentFolderId: number;
  onSuccess: () => void;
}

export default function MoveModal({ visible, onClose, item, currentFolderId, onSuccess }: MoveModalProps) {
  const { tokens } = useAuth();
  const [folders, setFolders] = useState<CloudFolder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadFolders();
    } else {
      setSearchQuery('');
      setFolders([]);
    }
  }, [visible]);

  useEffect(() => {
    if (!searchQuery) {
      setFolders([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      loadFolders();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadFolders = async () => {
    if (!tokens?.accessToken) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        name: searchQuery,
        folderId: '1',
      });

      const response = await fetch(`${apiCloudUrl}/folders?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar pastas');
      }

      const data = await response.json();
      setFolders(data.content || []);
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as pastas');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (targetFolderId: number) => {
    if (!item || !tokens?.accessToken) return;

    setLoading(true);
    try {
      const isFolder = isCloudFolder(item);
      const endpoint = isFolder ? '/folders/change-parent' : '/files/change-parent';
      
      const requestBody = {
        idsToChange: [item.id],
        newFolderId: targetFolderId,
      };

      const response = await fetch(`${apiCloudUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Erro ao mover item');
      }

      Alert.alert('Sucesso', `${isFolder ? 'Pasta' : 'Arquivo'} movido com sucesso!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao mover item:', error);
      Alert.alert('Erro', 'Falha ao mover item');
    } finally {
      setLoading(false);
    }
  };

  const fixedCloudFolder = {
    id: 1,
    name: 'Cloud',
    path: '/Cloud',
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 500, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>Mover para</Text>
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{item?.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {/* Busca de pastas */}
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                padding: 12,
                fontSize: 14,
              }}
              placeholder="Pesquisar pasta"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Lista de pastas */}
          <View style={{ 
            borderWidth: 1,
            borderColor: '#f0f0f0',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              padding: 12,
              backgroundColor: '#fafafa',
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
            }}>
              <Text style={{ flex: 1, fontWeight: '600', fontSize: 14 }}>Nome</Text>
              <Text style={{ flex: 1, fontWeight: '600', fontSize: 14 }}>Local</Text>
            </View>

            {/* Lista */}
            <ScrollView style={{ maxHeight: 350 }}>
              {loading ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#4F6AF5" />
                  <Text style={{ marginTop: 8, color: '#6b7280' }}>Carregando pastas...</Text>
                </View>
              ) : (
                <>
                  {/* Pasta Cloud raiz */}
                  {currentFolderId !== 1 && (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f0f0f0',
                      }}
                      onPress={() => handleMove(fixedCloudFolder.id)}
                    >
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="folder" size={20} color="#d97706" />
                        <Text style={{ fontWeight: '600' }}>{fixedCloudFolder.name}</Text>
                      </View>
                      <Text style={{ flex: 1, color: '#6b7280', fontSize: 13 }}>{fixedCloudFolder.path}</Text>
                    </TouchableOpacity>
                  )}

                  {/* Outras pastas */}
                  {folders.length > 0 ? (
                    folders.map((folder, index) => (
                      <TouchableOpacity
                        key={folder.id}
                        style={{
                          flexDirection: 'row',
                          padding: 12,
                          borderBottomWidth: index < folders.length - 1 ? 1 : 0,
                          borderBottomColor: '#f0f0f0',
                        }}
                        onPress={() => handleMove(folder.id)}
                      >
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <MaterialCommunityIcons name="folder" size={20} color="#d97706" />
                          <Text>{folder.name}</Text>
                        </View>
                        <Text style={{ flex: 1, color: '#6b7280', fontSize: 13 }}>{folder.path || '/'}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    !loading && (
                      <View style={{ padding: 32, alignItems: 'center' }}>
                        <Text style={{ color: '#6b7280' }}>Nenhuma pasta encontrada</Text>
                      </View>
                    )
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
