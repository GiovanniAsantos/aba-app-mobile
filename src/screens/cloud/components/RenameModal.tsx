import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CloudItem } from '@/types/cloud';
import { isCloudFolder } from '@/types/cloud';
import { useAuth } from '@/context/AuthProvider';
import { apiCloudUrl } from '@/config/api';

interface RenameModalProps {
    visible: boolean;
    onClose: () => void;
    item: CloudItem | null;
    onSuccess: () => void;
}

export default function RenameModal({ visible, onClose, item, onSuccess }: RenameModalProps) {
    const { tokens } = useAuth();
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (visible && item) {
            setNewName(item.name);
        }
    }, [visible, item]);

    const handleRename = async () => {
        if (!item || !newName.trim()) {
            Alert.alert('Erro', 'Digite um novo nome');
            return;
        }

        try {
            setLoading(true);
            const isFolder = isCloudFolder(item);
            
            if (isFolder) {
                // Para pastas: usa query parameter
                const params = new URLSearchParams({
                    nameFolder: newName
                });

                const response = await fetch(`${apiCloudUrl}/folders/${item.id}/rename?${params.toString()}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${tokens?.accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro ao renomear pasta');
                }
            } else {
                // Para arquivos: usa body JSON
                const response = await fetch(`${apiCloudUrl}/files/${item.id}/rename`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tokens?.accessToken}`,
                    },
                    body: JSON.stringify({
                        name: newName,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Erro ao renomear arquivo');
                }
            }

            Alert.alert('Sucesso', 'Item renomeado com sucesso!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Erro ao renomear:', error);
            Alert.alert('Erro', 'Falha ao renomear item');
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
                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>Renomear</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text style={{ marginBottom: 10, fontSize: 14, color: '#374151' }}>Novo Nome</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 8,
                                padding: 12,
                                fontSize: 14,
                            }}
                            placeholder="Digite o novo nome"
                            value={newName}
                            onChangeText={setNewName}
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
                            onPress={handleRename}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Renomear</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
