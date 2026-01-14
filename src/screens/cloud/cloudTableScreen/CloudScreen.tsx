import { MainLayout } from '@/components';
import { apiCloudUrl } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import type { CloudItem, CloudFile } from '@/types/cloud';
import { isCloudFile, isCloudFolder } from '@/types/cloud';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import type { NavigationProps } from '../../../types/navigation';
import ModalViewPdf from '@/components/modalViewPdf/ModalViewPdf';
import * as DocumentPicker from 'expo-document-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import PageHeader from '@/components/layout/PageHeader';
import { RenameModal, CreateFolderModal, ShareModal, MoveModal, DetailsModal, PermissionsModal } from '../components';
import { styles } from './style';

type CloudSearchResponse = {
  message: string;
  status: number;
  timestamp: string;
  content: {
    id: number;
    name: string;
    size?: number;
    parentFolder: any;
    items: CloudItem[];
    permissions: any[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
};

type BreadcrumbItem = {
  id: number;
  name: string;
};

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default function CloudScreen({ navigation }: NavigationProps<'Cloud'>) {
  const { tokens } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CloudItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<{
    id: number;
    name: string;
    size?: number;
  } | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([{ id: 1, name: 'Cloud' }]);
  const [pagination, setPagination] = useState<{
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  }>({
    pageNumber: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CloudItem | null>(null);
  
  // Modais para visualização e ações
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [createFolderModalVisible, setCreateFolderModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const searchCloudItems = async (page: number = 1, query: string = '', folderId?: number) => {
    if (!tokens?.accessToken) {
      Alert.alert('Erro', 'Token de acesso não encontrado');
      return;
    }

    try {
      setLoading(true);

      const folderToSearch = folderId || currentFolder?.id || 1;

      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        page: page.toString(),
        name: query,
        folderId: folderToSearch.toString()
      });

      const url = `${apiCloudUrl}/folders/search?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data: CloudSearchResponse = await response.json();

      setItems(data.content.items);
      setCurrentFolder({
        id: data.content.id,
        name: data.content.name,
        size: data.content.size,
      });
      setPagination({
        pageNumber: data.content.pageNumber,
        pageSize: data.content.pageSize,
        totalRecords: data.content.totalRecords,
        totalPages: data.content.totalPages,
      });
    } catch (error: any) {
      console.error('Erro ao buscar itens:', error);
      Alert.alert('Erro', error.message || 'Não foi possível carregar os itens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCloudItems(1, searchQuery);
  }, [searchQuery]);

  const navigateToFolder = (folder: CloudItem) => {
    if (!isCloudFolder(folder)) return;
    
    const newBreadcrumb = [...breadcrumb, { id: folder.id, name: folder.name }];
    setBreadcrumb(newBreadcrumb);
    searchCloudItems(1, '', folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    const targetFolder = breadcrumb[index];
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);
    searchCloudItems(1, '', targetFolder.id);
  };

  const openFile = async (file: CloudItem) => {
    if (!isCloudFile(file)) return;

    try {
      const fileKey = file.fileProps.key;
      const url = `${apiCloudUrl}/files/${fileKey}/download`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo: ${response.status}`);
      }

      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        let base64Data = reader.result as string;
        
        // Garantir que o MIME type seja correto
        if (base64Data.startsWith('data:application/octet-stream')) {
          base64Data = base64Data.replace(
            'data:application/octet-stream',
            'data:application/pdf'
          );
        }
        
        setPdfUrl(base64Data);
        setPdfModalVisible(true);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error);
      Alert.alert('Erro', 'Não foi possível abrir o arquivo');
    }
  };

  const downloadFile = async (file: CloudItem) => {
    if (!isCloudFile(file)) return;

    try {
      const fileKey = file.fileProps.key;
      const url = `${apiCloudUrl}/files/${fileKey}/download`;
      
      const { config, fs } = ReactNativeBlobUtil;
      const downloads = fs.dirs.DownloadDir;
      const fileName = file.name;
      
      Alert.alert(
        'Download',
        `Deseja baixar ${fileName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Baixar',
            onPress: async () => {
              try {
                const res = await config({
                  fileCache: true,
                  addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    path: `${downloads}/${fileName}`,
                    description: 'Baixando arquivo',
                  },
                })
                .fetch('GET', url, {
                  Authorization: `Bearer ${tokens?.accessToken}`,
                });
                
                Alert.alert('Sucesso', 'Arquivo baixado com sucesso!');
              } catch (error) {
                console.error('Erro ao baixar:', error);
                Alert.alert('Erro', 'Falha ao baixar arquivo');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao preparar download:', error);
      Alert.alert('Erro', 'Não foi possível baixar o arquivo');
    }
  };

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType || 'application/octet-stream',
        name: file.name,
      } as any);
      formData.append('folderId', (currentFolder?.id || 1).toString());

      const response = await fetch(`${apiCloudUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      Alert.alert('Sucesso', 'Arquivo enviado com sucesso!');
      searchCloudItems(pagination.pageNumber, searchQuery);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Falha ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const refreshCurrentFolder = () => {
    searchCloudItems(pagination.pageNumber, searchQuery);
  };

  const getStatusBadge = (item: CloudItem) => {
    if (!isCloudFile(item) || !item.fileProps.signature) return null;

    const isPending = item.fileProps.signature.status === 'ATIVADO_AGUARDANDO_ASSINATURAS';
    const isSigned = item.fileProps.signature.status === 'CONCLUIDO';

    if (isPending)
      return (
        <View style={styles.pendingBadge}>
          <MaterialCommunityIcons name="file-sign" size={12} color="#1d4ed8" />
          <Text style={styles.pendingBadgeText}>Assinatura Pendente</Text>
        </View>
      );
    if (isSigned)
      return (
        <View style={styles.signedBadge}>
          <MaterialCommunityIcons name="check-circle" size={12} color="#15803d" />
          <Text style={styles.signedBadgeText}>Documento Assinado</Text>
        </View>
      );
    return null;
  };

  const renderFileItem = (item: CloudItem) => {
    const isFolder = isCloudFolder(item);
    const ownerName = item.createdBy?.name;
    const itemSize = isFolder ? 0 : item.size;

    // Debug: verificar se createdAt está vindo
    if (!item.createdAt) {
      console.warn('Item sem createdAt:', item.name, item);
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.fileCard}
        activeOpacity={0.7}
        onPress={() => isFolder ? navigateToFolder(item) : openFile(item)}
      >
        <View style={styles.fileCardContent}>
          {/* Icon */}
          <View
            style={[
              styles.fileIcon,
              isFolder ? styles.folderIconBg : styles.fileIconBg,
            ]}
          >
            <MaterialCommunityIcons
              name={isFolder ? 'folder-open' : 'file-pdf-box'}
              size={24}
              color={isFolder ? '#d97706' : '#dc2626'}
            />
          </View>

          {/* Content */}
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>

            {/* Status Badge */}
            <View style={styles.statusBadgeContainer}>{getStatusBadge(item)}</View>

            {/* Meta Info */}
            <View style={styles.fileMeta}>
              {ownerName && (
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="account" size={12} color="#6b7280" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {ownerName}
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="calendar" size={12} color="#6b7280" />
                <Text style={styles.metaText}>{item.createdAt}</Text>
              </View>
              <Text style={styles.fileSize}>{formatBytes(itemSize)}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.fileActions}>
            {!isFolder && (
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.7}
                onPress={() => downloadFile(item)}
              >
                <MaterialCommunityIcons name="download" size={18} color="#1a1a1a" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
                setActionMenuVisible(true);
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="dots-vertical" size={18} color="#1a1a1a" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <View style={styles.cloudContainer}>
        <PageHeader 
          iconName="cloud-outline" 
          title="Cloud" 
          subtitle="Arquivos e pastas" 
          containerStyle={styles.pageHeaderContainer}
          titleStyle={styles.pageHeaderTitle}
          subtitleStyle={styles.pageHeaderSubtitle}
        />

        {/* Sticky Header */}
        <View style={styles.cloudHeader}>
          <View style={styles.cloudHeaderTop}>
            <View style={styles.viewModeButtons}>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('grid')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="view-grid"
                  size={18}
                  color={viewMode === 'grid' ? '#fff' : '#1a1a1a'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="view-list"
                  size={18}
                  color={viewMode === 'list' ? '#fff' : '#1a1a1a'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchFilterRow}>
            <View style={styles.cloudSearchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.cloudSearchInput}
                placeholder="Procurar arquivo"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              style={[styles.uploadButton, { flex: 1 }]} 
              activeOpacity={0.8}
              onPress={() => setCreateFolderModalVisible(true)}
            >
              <MaterialCommunityIcons name="folder-plus" size={20} color="#fff" />
              <Text style={styles.uploadButtonText}>Nova Pasta</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.uploadButton, { flex: 1 }]} 
              activeOpacity={0.8}
              onPress={handleUploadFile}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="upload" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Upload Arquivo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => navigateToBreadcrumb(0)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="home" size={16} color="#6b7280" />
          </TouchableOpacity>
          {breadcrumb.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#6b7280" />
              <TouchableOpacity onPress={() => navigateToBreadcrumb(index)}>
                <Text style={[styles.breadcrumbText, index === breadcrumb.length - 1 && { fontWeight: 'bold' }]}>
                  {crumb.name}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* File List */}
        <ScrollView style={styles.fileList} showsVerticalScrollIndicator={false}>
          {loading && items.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>Carregando...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>Nenhum item encontrado</Text>
            </View>
          ) : (
            items.map((item) => renderFileItem(item))
          )}
          <View style={{ height: 200 }} />
        </ScrollView>

        {/* Fixed Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Storage Info */}
          <View style={styles.storageInfo}>
            <View style={styles.storageTextRow}>
              <Text style={styles.storageText}>
                {currentFolder ? formatBytes(currentFolder.size) : '0 B'} Usados
              </Text>
            </View>
            <View style={styles.storageBar}>
              <View style={styles.storageBarFill} />
            </View>
          </View>

          {/* Pagination */}
          <View style={styles.cloudPagination}>
            <Text style={styles.paginationInfo}>
              {((pagination.pageNumber - 1) * pagination.pageSize) + 1}-
              {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalRecords)} de {pagination.totalRecords} itens
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[styles.paginationArrow, pagination.pageNumber === 1 && styles.paginationArrowDisabled]}
                disabled={pagination.pageNumber === 1}
                onPress={() => searchCloudItems(pagination.pageNumber - 1, searchQuery)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="chevron-left" size={18} color="#1a1a1a" />
              </TouchableOpacity>
              <View style={styles.paginationPageInfo}>
                <Text style={styles.paginationCurrentPage}>{pagination.pageNumber}</Text>
                <Text style={styles.paginationTotalPages}>de {pagination.totalPages}</Text>
              </View>
              <TouchableOpacity
                style={[styles.paginationArrow, pagination.pageNumber === pagination.totalPages && styles.paginationArrowDisabled]}
                disabled={pagination.pageNumber === pagination.totalPages}
                onPress={() => searchCloudItems(pagination.pageNumber + 1, searchQuery)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="chevron-right" size={18} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location selector removed */}

        {/* Action Menu Modal */}
        <Modal
          visible={actionMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActionMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionMenuVisible(false)}
          >
            <View style={styles.actionMenu}>
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  setRenameModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuText}>Renomear</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  setShareModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuText}>Compartilhar Link</Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  setPermissionsModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuText}>Gerenciar Permissões</Text>
              </TouchableOpacity> */}
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  setMoveModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuText}>Mover para</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  setDetailsModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuText}>Detalhes</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setActionMenuVisible(false);
                  Alert.alert('Em desenvolvimento', 'Funcionalidade de lixeira em breve');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuTextDanger}>Lixeira</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal de Visualização de PDF */}
        <ModalViewPdf
          visible={pdfModalVisible}
          onClose={() => {
            setPdfModalVisible(false);
            setPdfUrl('');
          }}
          pdfUrl={pdfUrl}
          fileName={selectedItem?.name || 'document.pdf'}
        />

        {/* Modais de Ações */}
        <CreateFolderModal
          visible={createFolderModalVisible}
          onClose={() => setCreateFolderModalVisible(false)}
          parentFolderId={currentFolder?.id || 1}
          onSuccess={refreshCurrentFolder}
        />

        <RenameModal
          visible={renameModalVisible}
          onClose={() => {
            setRenameModalVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onSuccess={refreshCurrentFolder}
        />

        <ShareModal
          visible={shareModalVisible}
          onClose={() => {
            setShareModalVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
        />

        <PermissionsModal
          visible={permissionsModalVisible}
          onClose={() => {
            setPermissionsModalVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onSuccess={refreshCurrentFolder}
        />

        <MoveModal
          visible={moveModalVisible}
          onClose={() => {
            setMoveModalVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          currentFolderId={currentFolder?.id || 1}
          onSuccess={refreshCurrentFolder}
        />

        <DetailsModal
          visible={detailsModalVisible}
          onClose={() => {
            setDetailsModalVisible(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
        />
      </View>
    </MainLayout>
  );
}
