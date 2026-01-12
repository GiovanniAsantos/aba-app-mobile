import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  owner: string;
  createdAt: string;
  size: string;
  status?: 'pending' | 'signed' | null;
  fileType?: string;
};

const mockData: FileItem[] = [
  {
    id: '1',
    name: 'Pasta Conta 01',
    type: 'folder',
    owner: 'Conta íydu 01',
    createdAt: '08/28/2025 15:59:49',
    size: '0 B',
  },
  {
    id: '2',
    name: 'Nova Pasta',
    type: 'folder',
    owner: 'Conta íydu 01',
    createdAt: '08/28/2025 15:59:49',
    size: '4.09 MB',
  },
  {
    id: '3',
    name: 'teste',
    type: 'folder',
    owner: 'Conta íydu 01',
    createdAt: '08/28/2025 15:59:49',
    size: '78.05 KB',
  },
  {
    id: '4',
    name: '0002(5).pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '12/11/2025 10:58:40',
    size: '35.04 KB',
    status: 'pending',
    fileType: 'pdf',
  },
  {
    id: '5',
    name: '0001(2).pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '12/11/2025 09:07:10',
    size: '35.04 KB',
    status: 'signed',
    fileType: 'pdf',
  },
  {
    id: '6',
    name: '250812_Cronograma CISAMAVI_V04.pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '09/22/2025 15:59:42',
    size: '86.65 KB',
    status: null,
    fileType: 'pdf',
  },
  {
    id: '7',
    name: 'Email – Luana Cavalcante – Outlook(1).pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '09/22/2025 15:43:02',
    size: '70.62 KB',
    status: 'pending',
    fileType: 'pdf',
  },
  {
    id: '8',
    name: 'Email – Luana Cavalcante – Outlook.pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '09/22/2025 15:35:14',
    size: '70.62 KB',
    status: null,
    fileType: 'pdf',
  },
  {
    id: '9',
    name: '0001(1).pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '09/08/2025 13:54:43',
    size: '35.04 KB',
    status: 'signed',
    fileType: 'pdf',
  },
  {
    id: '10',
    name: '0003(3).pdf',
    type: 'file',
    owner: 'Conta íydu 01',
    createdAt: '09/08/2025 09:33:40',
    size: '35.04 KB',
    status: 'signed',
    fileType: 'pdf',
  },
];

export default function CloudScreen({ navigation }: NavigationProps<'Cloud'>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('Cloud');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const itemsPerPage = 10;
  const totalItems = 168;

  const filteredData = mockData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    if (status === 'pending')
      return (
        <View style={styles.pendingBadge}>
          <MaterialCommunityIcons name="file-sign" size={12} color="#1d4ed8" />
          <Text style={styles.pendingBadgeText}>Assinatura Pendente</Text>
        </View>
      );
    if (status === 'signed')
      return (
        <View style={styles.signedBadge}>
          <MaterialCommunityIcons name="check-circle" size={12} color="#15803d" />
          <Text style={styles.signedBadgeText}>Documento Assinado</Text>
        </View>
      );
    return null;
  };

  const renderFileItem = (item: FileItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.fileCard}
      activeOpacity={0.7}
    >
      <View style={styles.fileCardContent}>
        {/* Icon */}
        <View
          style={[
            styles.fileIcon,
            item.type === 'folder' ? styles.folderIconBg : styles.fileIconBg,
          ]}
        >
          <MaterialCommunityIcons
            name={item.type === 'folder' ? 'folder-open' : 'file-pdf-box'}
            size={24}
            color={item.type === 'folder' ? '#d97706' : '#dc2626'}
          />
        </View>

        {/* Content */}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Status Badge */}
          {item.status && <View style={styles.statusBadgeContainer}>{getStatusBadge(item.status)}</View>}

          {/* Meta Info */}
          <View style={styles.fileMeta}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="account" size={12} color="#6b7280" />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.owner}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="calendar" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{item.createdAt}</Text>
            </View>
            <Text style={styles.fileSize}>{item.size}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.fileActions}>
          {item.type === 'file' && (
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="download" size={18} color="#1a1a1a" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
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

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <View style={styles.cloudContainer}>

      {/* Sticky Header */}
      <View style={styles.cloudHeader}>
        <View style={styles.cloudHeaderTop}>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => setLocationModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.locationText}>{selectedLocation}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color="#1a1a1a" />
          </TouchableOpacity>

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
          <TouchableOpacity
            style={styles.cloudFilterButton}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="tune" size={18} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
          <MaterialCommunityIcons name="upload" size={20} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload Arquivo</Text>
        </TouchableOpacity>
      </View>

      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <MaterialCommunityIcons name="home" size={16} color="#6b7280" />
        <MaterialCommunityIcons name="chevron-right" size={16} color="#6b7280" />
        <Text style={styles.breadcrumbText}>{selectedLocation}</Text>
      </View>

      {/* File List */}
      <ScrollView style={styles.fileList} showsVerticalScrollIndicator={false}>
        {filteredData.map((item) => renderFileItem(item))}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        {/* Storage Info */}
        <View style={styles.storageInfo}>
          <View style={styles.storageTextRow}>
            <Text style={styles.storageText}>548.86 MB de 0 B Usados</Text>
            <Text style={styles.storagePercent}>0%</Text>
          </View>
          <View style={styles.storageBar}>
            <View style={styles.storageBarFill} />
          </View>
        </View>

        {/* Pagination */}
        <View style={styles.cloudPagination}>
          <Text style={styles.paginationInfo}>
            1-10 de {totalItems} itens
          </Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={[styles.paginationArrow, currentPage === 1 && styles.paginationArrowDisabled]}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage(currentPage - 1)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-left" size={18} color="#1a1a1a" />
            </TouchableOpacity>
            <View style={styles.paginationPageInfo}>
              <Text style={styles.paginationCurrentPage}>{currentPage}</Text>
              <Text style={styles.paginationTotalPages}>de {totalPages}</Text>
            </View>
            <TouchableOpacity
              style={[styles.paginationArrow, currentPage === totalPages && styles.paginationArrowDisabled]}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage(currentPage + 1)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="chevron-right" size={18} color="#1a1a1a" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Location Modal */}
      <Modal
        visible={locationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLocationModalVisible(false)}
        >
          <View style={styles.locationModal}>
            {['Cloud', 'Local', 'Compartilhado'].map((location) => (
              <TouchableOpacity
                key={location}
                style={styles.locationOption}
                onPress={() => {
                  setSelectedLocation(location);
                  setLocationModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.locationOptionText, selectedLocation === location && styles.locationOptionTextActive]}>
                  {location}
                </Text>
                {selectedLocation === location && (
                  <MaterialCommunityIcons name="check" size={20} color="#4F6AF5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Tipo de Arquivo</Text>
                {['Todos', 'PDF', 'Documentos', 'Imagens'].map((type) => (
                  <TouchableOpacity key={type} style={styles.filterOption} activeOpacity={0.7}>
                    <Text style={styles.filterOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                {['Todos', 'Assinatura Pendente', 'Documento Assinado'].map((status) => (
                  <TouchableOpacity key={status} style={styles.filterOption} activeOpacity={0.7}>
                    <Text style={styles.filterOptionText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
            {['Abrir', 'Renomear', 'Compartilhar', 'Mover para'].map((action) => (
              <TouchableOpacity
                key={action}
                style={styles.actionMenuItem}
                onPress={() => setActionMenuVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionMenuText}>{action}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => setActionMenuVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionMenuTextDanger}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      </View>
    </MainLayout>
  );
}
