import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CloudItem } from '@/types/cloud';
import { isCloudFolder } from '@/types/cloud';

interface DetailsModalProps {
  visible: boolean;
  onClose: () => void;
  item: CloudItem | null;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function DetailsModal({ visible, onClose, item }: DetailsModalProps) {
  if (!item) return null;

  const isFolder = isCloudFolder(item);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '90%', maxWidth: 400, maxHeight: '80%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1a1a1a' }}>Detalhes</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={{ gap: 15 }}>
              <DetailRow 
                icon="folder-open" 
                label="Nome" 
                value={item.name} 
                iconColor={isFolder ? '#d97706' : '#dc2626'}
              />
              
              <DetailRow 
                icon="identifier" 
                label="ID" 
                value={item.id.toString()} 
              />
              
              {!isFolder && (
                <DetailRow 
                  icon="file-document" 
                  label="Tamanho" 
                  value={formatBytes(item.size)} 
                />
              )}
              
              <DetailRow 
                icon="calendar" 
                label="Data de criação" 
                value={item.createdAt} 
              />
              
              <DetailRow 
                icon="account" 
                label="Criado por" 
                value={item.createdBy?.name || 'N/A'} 
              />
              
              {!isFolder && item.fileProps && (
                <>
                  <DetailRow 
                    icon="file-key" 
                    label="Key" 
                    value={item.fileProps.key} 
                  />
                  
                  <DetailRow 
                    icon="file-document-outline" 
                    label="Tipo" 
                    value={item.fileProps.type} 
                  />
                  
                  <DetailRow 
                    icon="file-cog" 
                    label="Subtipo" 
                    value={item.fileProps.subType} 
                  />
                </>
              )}
              
              {item.permissions && item.permissions.length > 0 && (
                <DetailRow 
                  icon="shield-check" 
                  label="Permissões" 
                  value={item.permissions.join(', ')} 
                />
              )}
              
              {item.favorite !== null && (
                <DetailRow 
                  icon="star" 
                  label="Favorito" 
                  value={item.favorite ? 'Sim' : 'Não'} 
                  iconColor={item.favorite ? '#fbbf24' : '#6b7280'}
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ icon, label, value, iconColor = '#6b7280' }: { 
  icon: string; 
  label: string; 
  value: string;
  iconColor?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{label}</Text>
        <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '500' }}>{value}</Text>
      </View>
    </View>
  );
}
