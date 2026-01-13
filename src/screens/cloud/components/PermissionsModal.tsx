import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CloudItem, CloudFile } from '@/types/cloud';
import { useAuth } from '@/context/AuthProvider';
import { apiCloudUrl } from '@/config/api';

interface PermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  item: CloudItem | null;
  onSuccess: () => void;
}

type Permission = 'READ' | 'EDITOR' | 'NONE';

type UserWithPermission = {
  id: number;
  identifier?: number;
  email: string;
  name: string;
  permissions: string[];
};

export default function PermissionsModal({ visible, onClose, item, onSuccess }: PermissionsModalProps) {
  const { tokens } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersWithPermissions, setUsersWithPermissions] = useState<UserWithPermission[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (visible && item) {
      loadUsersWithPermissions();
    } else {
      setEmail('');
      setUsersWithPermissions([]);
      setSearchResults([]);
    }
  }, [visible, item]);

  // Debounce para busca de usuários
  useEffect(() => {
    if (!email || email.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [email]);

  const loadUsersWithPermissions = async () => {
    if (!item || !tokens?.accessToken) return;

    setLoading(true);
    try {
      let endpoint: string;
      if (item.isFolder) {
        endpoint = `/folders/permissions/${item.id}`;
      } else {
        // Para arquivos, usa a key do fileProps
        const fileItem = item as CloudFile;
        const fileKey = fileItem.fileProps?.key || item.id;
        endpoint = `/files/permissions/${fileKey}`;
      }
      
      const response = await fetch(`${apiCloudUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsersWithPermissions(data.content || []);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      Alert.alert('Erro', 'Falha ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!tokens?.accessToken || !email) return;

    setSearching(true);
    try {
      const response = await fetch(`${apiCloudUrl}/users/search?email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      const data = await response.json();
      setSearchResults(data.content || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleShareWithUser = async (user: any, permission: Permission) => {
    if (!item || !tokens?.accessToken) return;

    setLoading(true);
    try {
      const endpoint = item.isFolder ? '/folders/permissions' : '/files/permissions';
      
      // Converter Permission para array de strings como o backend espera
      let permissionsArray: string[];
      if (permission === 'EDITOR') {
        permissionsArray = ['EXCLUDE', 'UPDATE'];
      } else if (permission === 'READ') {
        permissionsArray = ['READ'];
      } else {
        permissionsArray = [];
      }

      const requestBody: any = {
        identifier: user.id,
        permissions: permissionsArray,
      };

      if (item.isFolder) {
        requestBody.folderId = item.id;
      } else {
        const fileItem = item as CloudFile;
        requestBody.fileId = fileItem.fileProps?.key || item.id;
      }

      const response = await fetch(`${apiCloudUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Erro ao compartilhar');
      }

      Alert.alert('Sucesso', `Permissão concedida para ${user.name}`);
      setEmail('');
      setSearchResults([]);
      loadUsersWithPermissions();
      onSuccess();
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Falha ao compartilhar item');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePermission = async (userId: number, newPermission: Permission) => {
    if (!item || !tokens?.accessToken) return;

    setLoading(true);
    try {
      const endpoint = item.isFolder ? '/folders/permissions' : '/files/permissions';
      
      // Converter Permission para array de strings como o backend espera
      let permissionsArray: string[];
      if (newPermission === 'EDITOR') {
        permissionsArray = ['EXCLUDE', 'UPDATE'];
      } else if (newPermission === 'READ') {
        permissionsArray = ['READ'];
      } else {
        permissionsArray = [];
      }

      const requestBody: any = {
        identifier: userId,
        permissions: permissionsArray,
      };

      if (item.isFolder) {
        requestBody.folderId = item.id;
      } else {
        const fileItem = item as CloudFile;
        requestBody.fileId = fileItem.fileProps?.key || item.id;
      }

      const response = await fetch(`${apiCloudUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar permissão');
      }

      Alert.alert('Sucesso', 'Permissão atualizada');
      loadUsersWithPermissions();
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      Alert.alert('Erro', 'Falha ao atualizar permissão');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (userId: number) => {
    if (!item || !tokens?.accessToken) return;

    Alert.alert(
      'Remover Permissão',
      'Tem certeza que deseja remover a permissão deste usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const endpoint = item.isFolder ? '/folders/permissions' : '/files/permissions';
              
              const requestBody: any = {
                identifier: userId,
                permissions: [],
              };

              if (item.isFolder) {
                requestBody.folderId = item.id;
              } else {
                const fileItem = item as CloudFile;
                requestBody.fileId = fileItem.fileProps?.key || item.id;
              }

              // Remover permissão enviando array vazio
              const response = await fetch(`${apiCloudUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${tokens.accessToken}`,
                },
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                throw new Error('Erro ao remover permissão');
              }

              Alert.alert('Sucesso', 'Permissão removida');
              loadUsersWithPermissions();
              onSuccess();
            } catch (error) {
              console.error('Erro ao remover permissão:', error);
              Alert.alert('Erro', 'Falha ao remover permissão');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getDefaultValue = (permissions: string[]): Permission => {
    if (!permissions || permissions.length === 0) return 'NONE';
    if (permissions.includes('EXCLUDE') && permissions.includes('UPDATE')) return 'EDITOR';
    if (permissions.includes('READ')) return 'READ';
    return 'NONE';
  };

  const getPermissionLabel = (permission: Permission) => {
    switch (permission) {
      case 'READ': return 'Leitor';
      case 'EDITOR': return 'Editor';
      case 'NONE': return 'Sem acesso';
      default: return permission;
    }
  };

  const getPermissionColor = (permission: Permission) => {
    switch (permission) {
      case 'READ': return '#3b82f6';
      case 'EDITOR': return '#10b981';
      case 'NONE': return '#6b7280';
      default: return '#6b7280';
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
        <View style={{ 
          backgroundColor: '#fff', 
          borderRadius: 12, 
          padding: 20, 
          width: '90%', 
          maxWidth: 600, 
          maxHeight: '80%',
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>
                {item?.isFolder ? 'Compartilhar Pasta' : 'Compartilhar Arquivo'}
              </Text>
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{item?.name || 'Gerenciar permissões'}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 20 }} />

          {loading && usersWithPermissions.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4F6AF5" />
              <Text style={{ marginTop: 12, color: '#6b7280' }}>Carregando...</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Busca de usuário */}
              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 14,
                  }}
                  placeholder="Pesquisar usuário"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                {/* Indicador de busca */}
                {searching && (
                  <View style={{ padding: 12, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#4F6AF5" />
                  </View>
                )}

                {/* Resultados da busca */}
                {searchResults.length > 0 && (
                  <View style={{ 
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    marginTop: 12,
                    maxHeight: 200,
                    backgroundColor: '#f9fafb',
                  }}>
                    <ScrollView>
                      {searchResults.map((user, index) => {
                        const existingUser = usersWithPermissions.find(u => u.id === user.id || u.identifier === user.id);
                        return (
                          <View 
                            key={user.id}
                            style={{
                              padding: 12,
                              borderBottomWidth: index < searchResults.length - 1 ? 1 : 0,
                              borderBottomColor: '#e5e7eb',
                            }}
                          >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '500' }}>{user.name}</Text>
                                <Text style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</Text>
                              </View>
                              {existingUser ? (
                                <View style={{
                                  paddingHorizontal: 10,
                                  paddingVertical: 4,
                                  borderRadius: 4,
                                  backgroundColor: '#e5e7eb',
                                }}>
                                  <Text style={{ fontSize: 11, color: '#6b7280', fontWeight: '600' }}>
                                    Já possui acesso
                                  </Text>
                                </View>
                              ) : (
                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                  {(['READ', 'EDITOR', 'NONE'] as Permission[]).map((perm) => (
                                    <TouchableOpacity
                                      key={perm}
                                      style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 6,
                                        backgroundColor: getPermissionColor(perm) + '20',
                                        borderWidth: 1,
                                        borderColor: getPermissionColor(perm),
                                      }}
                                      onPress={() => handleShareWithUser(user, perm)}
                                    >
                                      <Text style={{ 
                                        fontSize: 11, 
                                        color: getPermissionColor(perm),
                                        fontWeight: '600',
                                      }}>
                                        {getPermissionLabel(perm)}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 16 }} />

              {/* Lista de usuários com permissão */}
              <View style={{ flex: 1 }}>
                {usersWithPermissions.length > 0 ? (
                  usersWithPermissions.map((user, index) => {
                    const userId = user.identifier || user.id;
                    const currentPermission = getDefaultValue(user.permissions);
                    
                    return (
                      <View
                        key={`${userId}${index}`}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 12,
                          borderBottomWidth: index < usersWithPermissions.length - 1 ? 1 : 0,
                          borderBottomColor: '#f3f4f6',
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600' }}>{user.name}</Text>
                          {user.email && (
                            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{user.email}</Text>
                          )}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {/* Select de permissão */}
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {(['READ', 'EDITOR', 'NONE'] as Permission[]).map((perm) => (
                              <TouchableOpacity
                                key={perm}
                                style={{
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  borderRadius: 4,
                                  backgroundColor: currentPermission === perm ? getPermissionColor(perm) + '30' : '#f3f4f6',
                                  borderWidth: currentPermission === perm ? 1.5 : 0,
                                  borderColor: currentPermission === perm ? getPermissionColor(perm) : 'transparent',
                                }}
                                onPress={() => {
                                  if (currentPermission !== perm) {
                                    handleChangePermission(userId, perm);
                                  }
                                }}
                              >
                                <Text style={{ 
                                  fontSize: 11, 
                                  color: currentPermission === perm ? getPermissionColor(perm) : '#6b7280',
                                  fontWeight: currentPermission === perm ? '700' : '500',
                                }}>
                                  {getPermissionLabel(perm)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>

                          <TouchableOpacity onPress={() => handleRemovePermission(userId)}>
                            <MaterialCommunityIcons name="close-circle" size={22} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ padding: 30, alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account-off" size={56} color="#d1d5db" />
                    <Text style={{ color: '#6b7280', marginTop: 12, textAlign: 'center', fontSize: 14 }}>
                      Nenhum usuário com acesso
                    </Text>
                  </View>
                )}
              </View>

              {/* Card de descrições */}
              <View style={{
                backgroundColor: '#eff6ff',
                borderRadius: 8,
                padding: 14,
                marginTop: 20,
                borderWidth: 1,
                borderColor: '#bae6fd',
              }}>
                <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#1e40af' }}>
                  Descrição das Permissões:
                </Text>
                <Text style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
                  • <Text style={{ fontWeight: '600' }}>Leitor:</Text> Pode visualizar o conteúdo
                </Text>
                <Text style={{ fontSize: 12, color: '#374151' }}>
                  • <Text style={{ fontWeight: '600' }}>Editor:</Text> Pode visualizar e editar o conteúdo
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
