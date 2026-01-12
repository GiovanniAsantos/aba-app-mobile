import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components';
import { useAuth } from '@/context/AuthProvider';
import { apiCloudUrl } from '@/config/api';

interface FileItem {
  id: number;
  name: string;
  isFolder: boolean;
  size?: number;
  createdBy?: {
    name: string;
    photo?: { path: string };
  };
  fileProps?: {
    key: string;
    type: string;
    size: number;
    signature?: {
      status: string;
    };
  };
  parentFolder?: any;
}

interface PathItem {
  path: string;
  id: number;
}

interface SelectFileFromCloudProps {
  visible: boolean;
  onClose: () => void;
  onSelectFiles: (files: FileItem[]) => void;
}

export function SelectFileFromCloud({
  visible,
  onClose,
  onSelectFiles,
}: SelectFileFromCloudProps) {
  const { tokens } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<PathItem[]>([
    { path: 'Cloud', id: 1 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    if (visible) {
      getFiles(1, 1, 20);
      setSelectedFiles([]);
      setSearchTerm('');
      setIsSearchMode(false);
    }
  }, [visible]);

  const getFiles = async (
    folderId: number,
    page: number = 1,
    limit: number = 20,
    searchName?: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        folderId: folderId.toString(),
      });

      if (searchName && searchName.trim() !== '') {
        params.append('name', searchName);
        setIsSearchMode(true);
      } else {
        setIsSearchMode(false);
      }

      const response = await fetch(
        `${apiCloudUrl}/folders/search?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar arquivos');
      }

      const data = await response.json();
      
      setFiles(data.content.items || []);
      setPagination({
        current: data.content.pageNumber || 1,
        limit: limit,
        total: data.content.totalRecords || 0,
      });

      if (!searchName) {
        updateCurrentPath(data.content);
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os arquivos');
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentPath = (data: any) => {
    const path: PathItem[] = [];
    const processPath = (obj: any) => {
      if (obj.parentFolder !== null) {
        path.unshift({ path: obj.name, id: obj.id });
        processPath(obj.parentFolder);
      } else {
        path.unshift({ path: 'Cloud', id: obj.id });
      }
    };
    processPath(data);
    setCurrentPath(path);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      getFiles(currentPath[currentPath.length - 1].id, 1, pagination.limit, searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    getFiles(currentPath[currentPath.length - 1].id, 1, pagination.limit);
  };

  const handleFolderClick = (folder: FileItem) => {
    getFiles(folder.id, 1, pagination.limit);
  };

  const handleFileToggle = (file: FileItem) => {
    // Só permite selecionar PDFs não assinados
    if (file.fileProps?.type !== 'application/pdf') {
      Alert.alert('Aviso', 'Apenas arquivos PDF podem ser selecionados');
      return;
    }

    if (
      file.fileProps?.signature &&
      file.fileProps.signature.status !== 'CANCELADO'
    ) {
      Alert.alert(
        'Aviso',
        'Este arquivo possui assinatura ativa e não pode ser selecionado'
      );
      return;
    }

    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.id === file.id);
      if (isSelected) {
        return prev.filter((f) => f.id !== file.id);
      } else {
        return [...prev, file];
      }
    });
  };

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);
      formData.append('FolderId', currentPath[currentPath.length - 1].id.toString());

      const response = await fetch(`${apiCloudUrl}/files/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      Alert.alert('Sucesso', 'Arquivo enviado com sucesso!');
      // Recarrega a lista
      getFiles(currentPath[currentPath.length - 1].id, pagination.current, pagination.limit);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Não foi possível enviar o arquivo');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Aviso', 'Selecione pelo menos um arquivo');
      return;
    }
    onSelectFiles(selectedFiles);
    onClose();
  };

  const handlePathNavigation = (pathIndex: number) => {
    const targetPath = currentPath[pathIndex];
    getFiles(targetPath.id, 1, pagination.limit);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const getFileIcon = (item: FileItem) => {
    if (item.isFolder) {
      return 'folder';
    }
    const type = item.fileProps?.type;
    if (type === 'application/pdf') return 'file-pdf-box';
    if (type?.includes('image')) return 'file-image';
    if (type?.includes('word')) return 'file-word';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return 'file-excel';
    if (type?.includes('powerpoint') || type?.includes('presentation')) return 'file-powerpoint';
    return 'file-document';
  };

  const getStatusBadge = (item: FileItem) => {
    if (!item.fileProps?.signature) return null;

    const status = item.fileProps.signature.status;
    let color = '#999';
    let text = status;

    switch (status) {
      case 'FINALIZADO':
      case 'ASSINADO_POR_TODOS':
        color = '#52c41a';
        text = 'Assinado';
        break;
      case 'ATIVADO_AGUARDANDO_ASSINATURAS':
      case 'ASSINADO_PARCIALMENTE':
        color = '#faad14';
        text = 'Pendente';
        break;
      case 'CANCELADO':
        color = '#f5222d';
        text = 'Cancelado';
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.statusText, { color }]}>{text}</Text>
      </View>
    );
  };

  const isFileSelected = (file: FileItem) => {
    return selectedFiles.some((f) => f.id === file.id);
  };

  const renderItem = ({ item }: { item: FileItem }) => {
    const isSelected = isFileSelected(item);
    const canSelect =
      !item.isFolder &&
      item.fileProps?.type === 'application/pdf' &&
      (!item.fileProps?.signature ||
        item.fileProps.signature.status === 'CANCELADO');

    return (
      <TouchableOpacity
        style={[styles.fileItem, isSelected && styles.fileItemSelected]}
        onPress={() => {
          if (item.isFolder) {
            handleFolderClick(item);
          } else if (canSelect) {
            handleFileToggle(item);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.fileItemLeft}>
          {canSelect && (
            <MaterialCommunityIcons
              name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={isSelected ? '#4F6AF5' : '#999'}
              style={styles.checkbox}
            />
          )}
          <MaterialCommunityIcons
            name={getFileIcon(item)}
            size={32}
            color={item.isFolder ? '#FDB022' : '#4F6AF5'}
          />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>
            {!item.isFolder && (
              <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
            )}
          </View>
        </View>
        {!item.isFolder && getStatusBadge(item)}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selecionar do Cloud</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Path breadcrumb */}
        <View style={styles.breadcrumb}>
          <MaterialCommunityIcons name="folder" size={20} color="#666" />
          <FlatList
            horizontal
            data={currentPath}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => handlePathNavigation(index)}
                style={styles.breadcrumbItem}
              >
                <Text style={styles.breadcrumbText}>{item.path}</Text>
                {index < currentPath.length - 1 && (
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#666" />
                )}
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Search and actions */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar arquivos..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={handleSearch}
            />
            {isSearchMode && (
              <TouchableOpacity onPress={clearSearch}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadFile}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="upload" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Selected count */}
        {selectedFiles.length > 0 && (
          <View style={styles.selectedBar}>
            <Text style={styles.selectedText}>
              {selectedFiles.length} arquivo{selectedFiles.length > 1 ? 's' : ''} selecionado
              {selectedFiles.length > 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFiles([])}>
              <Text style={styles.clearText}>Limpar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* File list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F6AF5" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : files.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="folder-open" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum arquivo encontrado</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={files}
              keyExtractor={(item) => `${item.id}`}
              renderItem={renderItem}
              contentContainerStyle={styles.fileList}
            />
            
            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.pageButton, pagination.current === 1 && styles.pageButtonDisabled]}
                  onPress={() => getFiles(currentPath[currentPath.length - 1].id, pagination.current - 1, pagination.limit)}
                  disabled={pagination.current === 1}
                >
                  <MaterialCommunityIcons name="chevron-left" size={20} color={pagination.current === 1 ? '#ccc' : '#4F6AF5'} />
                </TouchableOpacity>
                
                <Text style={styles.paginationText}>
                  Página {pagination.current} de {Math.ceil(pagination.total / pagination.limit)}
                </Text>
                
                <TouchableOpacity
                  style={[styles.pageButton, pagination.current >= Math.ceil(pagination.total / pagination.limit) && styles.pageButtonDisabled]}
                  onPress={() => getFiles(currentPath[currentPath.length - 1].id, pagination.current + 1, pagination.limit)}
                  disabled={pagination.current >= Math.ceil(pagination.total / pagination.limit)}
                >
                  <MaterialCommunityIcons name="chevron-right" size={20} color={pagination.current >= Math.ceil(pagination.total / pagination.limit) ? '#ccc' : '#4F6AF5'} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Footer buttons */}
        <View style={styles.footer}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button title="Cancelar" onPress={onClose} variant="secondary" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Button
              title={`Adicionar (${selectedFiles.length})`}
              onPress={handleConfirm}
              variant="primary"
              disabled={selectedFiles.length === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: '#4F6AF5',
    borderRadius: 8,
    width: 48,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e6f7ff',
    borderBottomWidth: 1,
    borderBottomColor: '#91d5ff',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0050b3',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F6AF5',
  },
  fileList: {
    padding: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fileItemSelected: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#4F6AF5',
  },
  fileItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    marginRight: 4,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  pageButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});
