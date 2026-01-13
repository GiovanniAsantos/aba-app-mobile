import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CloudItem } from '@/types/cloud';
import { useAuth } from '@/context/AuthProvider';
import { apiCloudUrl } from '@/config/api';
import * as Clipboard from 'expo-clipboard';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  item: CloudItem | null;
}

type LinkDuration = 1 | 10 | 20 | 30 | 60 | 240 | 720 | 1440 | 10080 | 44640;

export default function ShareModal({ visible, onClose, item }: ShareModalProps) {
  const { tokens } = useAuth();
  const [duration, setDuration] = useState<LinkDuration>(1);
  const [loading, setLoading] = useState(false);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [hasLink, setHasLink] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (visible && item) {
      checkExistingLink();
      setEditMode(false);
    } else {
      setLinkInfo(null);
      setHasLink(false);
      setDuration(1);
      setEditMode(false);
    }
  }, [visible, item]);

  const checkExistingLink = async () => {
    if (!item || !tokens?.accessToken) return;

    // Verifica se o item tem sharedLinkId
    const sharedLinkId = 'sharedLinkId' in item ? item.sharedLinkId : null;
    
    if (!sharedLinkId) {
      setHasLink(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiCloudUrl}/shared-link/${sharedLinkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setLinkInfo(data.content);
          setHasLink(true);
        }
      } else {
        setHasLink(false);
      }
    } catch (error) {
      console.error('Erro ao verificar link:', error);
      setHasLink(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!item || !tokens?.accessToken) return;

    setLoading(true);
    try {
      const requestBody = {
        durationMinuts: duration === 1 ? null : duration,
        emailToSend: '',
        sharedFileOrFolderid: item.id,
        typeLink: item.isFolder ? 1 : 0, // 0 = FILE, 1 = FOLDER
      };

      const response = await fetch(`${apiCloudUrl}/shared-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar link');
      }

      const data = await response.json();
      setLinkInfo(data.content);
      setHasLink(true);
      setEditMode(false);
      Alert.alert('Sucesso', 'Link criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar link:', error);
      Alert.alert('Erro', 'Falha ao criar link de compartilhamento');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLink = async () => {
    if (!item || !tokens?.accessToken || !linkInfo) return;

    const sharedLinkId = 'sharedLinkId' in item ? item.sharedLinkId : linkInfo.id;

    setLoading(true);
    try {
      const requestBody = {
        sharedLinkId: sharedLinkId,
        active: linkInfo.active,
        durationMinuts: duration === 1 ? null : duration,
      };

      const response = await fetch(`${apiCloudUrl}/shared-link`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar link');
      }

      const data = await response.json();
      setLinkInfo(data.content);
      setEditMode(false);
      Alert.alert('Sucesso', 'Link atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar link:', error);
      Alert.alert('Erro', 'Falha ao atualizar link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!item || !tokens?.accessToken) return;

    const sharedLinkId = 'sharedLinkId' in item ? item.sharedLinkId : linkInfo?.id;
    
    if (!sharedLinkId) {
      Alert.alert('Erro', 'ID do link não encontrado');
      return;
    }

    Alert.alert(
      'Excluir Link',
      'Tem certeza que deseja excluir este link de compartilhamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(`${apiCloudUrl}/shared-link/${sharedLinkId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${tokens.accessToken}`,
                },
              });

              if (!response.ok) {
                throw new Error('Erro ao excluir link');
              }

              Alert.alert('Sucesso', 'Link excluído com sucesso!');
              setLinkInfo(null);
              setHasLink(false);
              setEditMode(false);
              onClose();
            } catch (error) {
              console.error('Erro ao excluir link:', error);
              Alert.alert('Erro', 'Falha ao excluir link');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCopyLink = async () => {
    if (linkInfo?.link && linkInfo?.schema) {
      const fullLink = `${linkInfo.link}/${linkInfo.schema}`;
      await Clipboard.setStringAsync(fullLink);
      Alert.alert('Copiado', 'Link copiado para a área de transferência');
    } else if (linkInfo?.link) {
      await Clipboard.setStringAsync(linkInfo.link);
      Alert.alert('Copiado', 'Link copiado para a área de transferência');
    }
  };

  const getDurationLabel = (minutes: number) => {
    if (minutes === 1) return 'Sem limite';
    if (minutes === 10) return '10 minutos';
    if (minutes === 20) return '20 minutos';
    if (minutes === 30) return '30 minutos';
    if (minutes === 60) return '1 hora';
    if (minutes === 240) return '4 horas';
    if (minutes === 720) return '12 horas';
    if (minutes === 1440) return '1 dia';
    if (minutes === 10080) return '1 semana';
    if (minutes === 44640) return '1 mês';
    return `${minutes} minutos`;
  };

  const formatExpirationDate = (dateString: string | null) => {
    if (!dateString) return 'Sem limite';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderEditMode = () => (
    <ScrollView style={{ maxHeight: 500 }}>
      <View style={{ padding: 4 }}>
        {/* Link compartilhado */}
        <View style={{
          backgroundColor: '#f0f9ff',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#bae6fd',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="link-variant" size={18} color="#0369a1" />
            <Text style={{ fontSize: 13, color: '#0369a1', fontWeight: '600', marginLeft: 8 }}>
              Link de Compartilhamento
            </Text>
          </View>

          <View style={{ 
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#d1d5db',
            overflow: 'hidden',
            marginBottom: 12,
          }}>
            <TextInput
              style={{
                flex: 1,
                padding: 12,
                fontSize: 13,
                color: '#374151',
              }}
              value={linkInfo?.link && linkInfo?.schema ? `${linkInfo.link}/${linkInfo.schema}` : linkInfo?.link || ''}
              editable={false}
            />
            <TouchableOpacity
              style={{
                paddingHorizontal: 14,
                justifyContent: 'center',
                backgroundColor: '#4F6AF5',
              }}
              onPress={handleCopyLink}
            >
              <MaterialCommunityIcons name="content-copy" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#4F6AF5',
              paddingVertical: 10,
              borderRadius: 6,
            }}
            onPress={handleCopyLink}
          >
            <MaterialCommunityIcons name="content-copy" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
              Copiar Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status do Link */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 10 }}>
            Status do Link
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: linkInfo?.active === true ? '#10b981' : '#e5e7eb',
                backgroundColor: linkInfo?.active === true ? '#dcfce7' : '#fff',
                alignItems: 'center',
              }}
              onPress={() => setLinkInfo({ ...linkInfo, active: true })}
            >
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color={linkInfo?.active === true ? '#10b981' : '#9ca3af'} 
              />
              <Text style={{ 
                fontSize: 13,
                fontWeight: '600',
                color: linkInfo?.active === true ? '#10b981' : '#6b7280',
                marginTop: 4,
              }}>
                Ativo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: linkInfo?.active === false ? '#ef4444' : '#e5e7eb',
                backgroundColor: linkInfo?.active === false ? '#fee2e2' : '#fff',
                alignItems: 'center',
              }}
              onPress={() => setLinkInfo({ ...linkInfo, active: false })}
            >
              <MaterialCommunityIcons 
                name="close-circle" 
                size={20} 
                color={linkInfo?.active === false ? '#ef4444' : '#9ca3af'} 
              />
              <Text style={{ 
                fontSize: 13,
                fontWeight: '600',
                color: linkInfo?.active === false ? '#ef4444' : '#6b7280',
                marginTop: 4,
              }}>
                Desativado
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Duração do Link */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 10 }}>
            <MaterialCommunityIcons name="clock-outline" size={16} /> Duração do Link
          </Text>
          <View style={{ gap: 8 }}>
            {([1, 10, 20, 30, 60, 240, 720, 1440, 10080, 44640] as LinkDuration[]).map((dur) => (
              <TouchableOpacity
                key={dur}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: duration === dur ? '#4F6AF5' : '#e5e7eb',
                  backgroundColor: duration === dur ? '#eff6ff' : '#fff',
                }}
                onPress={() => setDuration(dur)}
              >
                <Text style={{ 
                  fontSize: 14,
                  fontWeight: duration === dur ? '600' : '400',
                  color: duration === dur ? '#1e40af' : '#374151',
                }}>
                  {getDurationLabel(dur)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Data de expiração calculada */}
        <View style={{
          backgroundColor: duration === 1 ? '#f0f9ff' : '#fff7ed',
          borderRadius: 8,
          padding: 14,
          marginBottom: 20,
          borderLeftWidth: 3,
          borderLeftColor: duration === 1 ? '#0ea5e9' : '#f59e0b',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons 
              name="calendar-clock" 
              size={18} 
              color={duration === 1 ? '#0ea5e9' : '#f59e0b'} 
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>
                Expiração do Link
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a1a' }}>
                {duration === 1 ? 'Sem limite' : (() => {
                  const expirationDate = new Date();
                  expirationDate.setMinutes(expirationDate.getMinutes() + duration);
                  return formatExpirationDate(expirationDate.toISOString());
                })()}
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#4F6AF5',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={handleUpdateLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                Salvar Alterações
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ef4444',
            }}
            onPress={handleDeleteLink}
          >
            <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600' }}>
              <MaterialCommunityIcons name="delete" size={16} color="#ef4444" /> Excluir Link
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#f3f4f6',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setEditMode(false)}
          >
            <Text style={{ color: '#374151', fontSize: 15, fontWeight: '600' }}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderLinkExists = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Card do Link */}
      <View style={{ 
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
      }}>
        {/* Status Badge */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Status
          </Text>
          <View style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: linkInfo?.active ? '#dcfce7' : '#fee2e2',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}>
            <View style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: linkInfo?.active ? '#16a34a' : '#dc2626',
            }} />
            <Text style={{ 
              fontSize: 12, 
              color: linkInfo?.active ? '#15803d' : '#dc2626',
              fontWeight: '600',
            }}>
              {linkInfo?.active ? 'Ativo' : 'Desativado'}
            </Text>
          </View>
        </View>

        {/* Data de Expiração */}
        <View style={{ 
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          borderLeftWidth: 3,
          borderLeftColor: '#4F6AF5',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MaterialCommunityIcons name="calendar-clock" size={18} color="#4F6AF5" />
            <Text style={{ fontSize: 12, color: '#64748b', marginLeft: 8, fontWeight: '600' }}>
              EXPIRAÇÃO
            </Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1e293b', marginLeft: 26 }}>
            {formatExpirationDate(linkInfo?.timeExpiration)}
          </Text>
        </View>

        {/* Campo do Link */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 8, fontWeight: '600' }}>
            LINK DE COMPARTILHAMENTO
          </Text>
          <View style={{ 
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#cbd5e1',
            overflow: 'hidden',
          }}>
            <TextInput
              style={{
                flex: 1,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 13,
                color: '#475569',
                fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
              }}
              value={linkInfo?.link && linkInfo?.schema ? `${linkInfo.link}/${linkInfo.schema}` : linkInfo?.link || ''}
              editable={false}
              numberOfLines={1}
            />
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                justifyContent: 'center',
                backgroundColor: '#4F6AF5',
              }}
              onPress={handleCopyLink}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="content-copy" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Copiar Link Grande */}
        <TouchableOpacity
          style={{
            backgroundColor: '#4F6AF5',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            shadowColor: '#4F6AF5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={handleCopyLink}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="content-copy" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
            Copiar Link
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botões de Ação */}
      <View style={{ gap: 12 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#4F6AF5',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={() => {
            setDuration(linkInfo?.timeExpiration ? 1440 : 1);
            setEditMode(true);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#4F6AF5" />
          <Text style={{ color: '#4F6AF5', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
            Editar Configurações
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#fff',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#ef4444',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={handleDeleteLink}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="delete-outline" size={18} color="#ef4444" />
          <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600', marginLeft: 8 }}>
            Excluir Link
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCreateLink = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
      {/* Informação Inicial */}
      <View style={{
        backgroundColor: '#f0f9ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4F6AF5',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="information" size={20} color="#4F6AF5" />
          <Text style={{ 
            fontSize: 13, 
            color: '#1e40af',
            marginLeft: 10,
            flex: 1,
            fontWeight: '500',
          }}>
            Crie um link seguro para compartilhar este arquivo
          </Text>
        </View>
      </View>

      <Text style={{ 
        fontSize: 13, 
        fontWeight: '600', 
        marginBottom: 12, 
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        Duração do Link
      </Text>
      
      <View style={{ gap: 10, marginBottom: 20 }}>
        {([1, 60, 240, 720, 1440, 10080, 44640] as LinkDuration[]).map((dur) => (
          <TouchableOpacity
            key={dur}
            style={{
              padding: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: duration === dur ? '#4F6AF5' : '#e2e8f0',
              backgroundColor: duration === dur ? '#eff6ff' : '#fff',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={() => setDuration(dur)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: duration === dur ? '#4F6AF5' : '#cbd5e1',
                backgroundColor: duration === dur ? '#4F6AF5' : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {duration === dur && (
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#fff',
                  }} />
                )}
              </View>
              <Text style={{ 
                fontSize: 15,
                fontWeight: duration === dur ? '600' : '400',
                color: duration === dur ? '#1e40af' : '#475569',
              }}>
                {getDurationLabel(dur)}
              </Text>
            </View>
            {duration === dur && (
              <MaterialCommunityIcons name="check" size={20} color="#4F6AF5" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Prévia da Expiração */}
      {duration !== null && (
        <View style={{
          backgroundColor: duration === 1 ? '#f0fdf4' : '#fff7ed',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          borderLeftWidth: 4,
          borderLeftColor: duration === 1 ? '#10b981' : '#f59e0b',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons 
              name={duration === 1 ? "check-circle" : "clock-alert-outline"} 
              size={20} 
              color={duration === 1 ? '#10b981' : '#f59e0b'} 
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ 
                fontSize: 12, 
                color: '#64748b',
                fontWeight: '600',
                marginBottom: 2,
              }}>
                {duration === 1 ? 'LINK PERMANENTE' : 'EXPIRA EM'}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600',
                color: duration === 1 ? '#15803d' : '#ea580c',
              }}>
                {duration === 1 
                  ? 'Válido indefinidamente' 
                  : (() => {
                      const expirationDate = new Date();
                      expirationDate.setMinutes(expirationDate.getMinutes() + duration);
                      return formatExpirationDate(expirationDate.toISOString());
                    })()
                }
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Botão Criar */}
      <TouchableOpacity
        style={{
          backgroundColor: '#4F6AF5',
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          shadowColor: '#4F6AF5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={handleCreateLink}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="link-variant" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 10 }}>
              Criar Link de Compartilhamento
            </Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end',
      }}>
        <View style={{ 
          backgroundColor: '#fff', 
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24, 
          maxHeight: '90%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
          {/* Header do Modal */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6',
          }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#eff6ff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <MaterialCommunityIcons name="share-variant" size={22} color="#4F6AF5" />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a' }}>
                  {editMode ? 'Editar Link' : hasLink ? 'Link Ativo' : 'Compartilhar'}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 52 }} numberOfLines={1}>
                {item?.name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#f3f4f6',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {loading && !editMode ? (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4F6AF5" />
              <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>Carregando informações...</Text>
            </View>
          ) : editMode ? (
            renderEditMode()
          ) : hasLink ? (
            renderLinkExists()
          ) : (
            renderCreateLink()
          )}
        </View>
      </View>
    </Modal>
  );
}
