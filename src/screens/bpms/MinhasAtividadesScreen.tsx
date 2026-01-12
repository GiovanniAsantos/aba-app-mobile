import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

type ActivityStatus = 'sem_sla' | 'etapa_conta' | 'atrasado' | 'inicial';
type ActivityType = 'pending' | 'created';

interface Activity {
  id: string;
  name: string;
  sla: ActivityStatus;
  currentStage: string;
  workflow: string;
  creationDate: string;
  dueDate: string | null;
  isNew: boolean;
  isDelayed?: boolean;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    name: 'Atividade 06',
    sla: 'sem_sla',
    currentStage: 'Etapa Conta 01',
    workflow: 'Fluxo Testes Gerais 001',
    creationDate: '17/12/2025',
    dueDate: null,
    isNew: true,
  },
  {
    id: '2',
    name: 'Atividade 05',
    sla: 'sem_sla',
    currentStage: 'Etapa Conta 01',
    workflow: 'Fluxo Testes Gerais 001',
    creationDate: '17/12/2025',
    dueDate: null,
    isNew: true,
  },
  {
    id: '3',
    name: 'Atividade 04',
    sla: 'sem_sla',
    currentStage: 'Etapa Conta 01',
    workflow: 'Fluxo Testes Gerais 001',
    creationDate: '17/12/2025',
    dueDate: null,
    isNew: true,
  },
  {
    id: '4',
    name: 'Avanço Sustentável',
    sla: 'atrasado',
    currentStage: 'Inicial',
    workflow: 'teste091225',
    creationDate: '09/12/2025',
    dueDate: '09/12/2025',
    isNew: true,
    isDelayed: true,
  },
  {
    id: '5',
    name: 'Impacto Zero',
    sla: 'atrasado',
    currentStage: 'Inicial',
    workflow: 'teste091225',
    creationDate: '09/12/2025',
    dueDate: '09/12/2025',
    isNew: true,
    isDelayed: true,
  },
];

const statusConfig = {
  sem_sla: {
    label: 'Sem SLA',
    backgroundColor: '#f3f4f6',
    textColor: '#6b7280',
    borderColor: '#e5e7eb',
  },
  etapa_conta: {
    label: 'Etapa Conta 01',
    backgroundColor: '#eff6ff',
    textColor: '#4F6AF5',
    borderColor: '#bfdbfe',
  },
  atrasado: {
    label: 'Atrasado',
    backgroundColor: '#fef2f2',
    textColor: '#ef4444',
    borderColor: '#fecaca',
  },
  inicial: {
    label: 'Inicial',
    backgroundColor: '#fef3c7',
    textColor: '#f59e0b',
    borderColor: '#fde68a',
  },
};

export default function MinhasAtividadesScreen({ navigation }: NavigationProps<'MinhasAtividades'>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<ActivityType>('pending');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const itemsPerPage = 10;

  const pendingCount = 199;
  const createdCount = 293;

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || activity.currentStage === selectedCategory;
    const matchesWorkflow = !selectedWorkflow || activity.workflow === selectedWorkflow;
    return matchesSearch && matchesCategory && matchesWorkflow;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const hasActiveFilters = !!(selectedCategory || selectedWorkflow);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedWorkflow('');
    setSearchQuery('');
    setFilterModalVisible(false);
  };

  const getActivityIcon = (activity: Activity) => {
    if (activity.isDelayed) {
      return <MaterialCommunityIcons name="alert-circle" size={20} color="#ef4444" />;
    }
    if (activity.sla === 'etapa_conta') {
      return <MaterialCommunityIcons name="cog" size={20} color="#4F6AF5" />;
    }
    return <MaterialCommunityIcons name="cog" size={20} color="#6b7280" />;
  };

  const renderActivity = (activity: Activity) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.activityCard}
      activeOpacity={0.7}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          {getActivityIcon(activity)}
        </View>
        <View style={styles.activityHeaderInfo}>
          <View style={styles.activityTitleRow}>
            <Text style={styles.activityTitle} numberOfLines={1}>
              {activity.name}
            </Text>
            {activity.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            )}
          </View>
          <Text style={styles.activityWorkflow} numberOfLines={1}>
            {activity.workflow}
          </Text>
        </View>
      </View>

      <View style={styles.activityBadges}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusConfig[activity.sla].backgroundColor,
              borderColor: statusConfig[activity.sla].borderColor,
            },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: statusConfig[activity.sla].textColor }]}>
            {statusConfig[activity.sla].label}
          </Text>
        </View>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{activity.currentStage}</Text>
        </View>
      </View>

      <View style={styles.activityDates}>
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="calendar" size={14} color="#6b7280" />
          <Text style={styles.dateText}>Criado: {activity.creationDate}</Text>
        </View>
        {activity.dueDate && (
          <View style={styles.dateItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
            <Text style={[styles.dateText, activity.isDelayed && styles.delayedText]}>
              Entrega: {activity.dueDate}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.openActivityButton} activeOpacity={0.8}>
        <Text style={styles.openActivityButtonText}>Abrir Atividade</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <View style={styles.activitiesContainer}>

      {/* Header */}
      <View style={styles.activitiesHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <View style={styles.activitiesIconContainer}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Minhas Atividades</Text>
            <Text style={styles.headerSubtitle}>Gerencie suas tarefas e atividades</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pendentes
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{pendingCount}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'created' && styles.activeTab]}
          onPress={() => setActiveTab('created')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
            Criadas
          </Text>
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{createdCount}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchFilterSection}>
        <View style={styles.searchRow}>
          <View style={styles.activitiesSearchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.activitiesSearchInput}
              placeholder="Buscar por nome, protocolo..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.activitiesFilterButton}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="filter-variant" size={18} color="#1a1a1a" />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            <Text style={styles.activeFiltersLabel}>Filtros ativos:</Text>
            {selectedCategory && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>{selectedCategory}</Text>
                <TouchableOpacity onPress={() => setSelectedCategory('')}>
                  <MaterialCommunityIcons name="close" size={14} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
            )}
            {selectedWorkflow && (
              <View style={styles.activeFilterBadge}>
                <Text style={styles.activeFilterText}>{selectedWorkflow}</Text>
                <TouchableOpacity onPress={() => setSelectedWorkflow('')}>
                  <MaterialCommunityIcons name="close" size={14} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Activities List */}
      <ScrollView style={styles.activitiesList} showsVerticalScrollIndicator={false}>
        {currentActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>Nenhuma atividade encontrada</Text>
          </View>
        ) : (
          currentActivities.map((activity) => renderActivity(activity))
        )}

        {/* Pagination */}
        {filteredActivities.length > 0 && totalPages > 1 && (
          <View style={styles.activitiesPagination}>
            <Text style={styles.paginationInfo}>
              {startIndex + 1}-{Math.min(endIndex, filteredActivities.length)} de {filteredActivities.length}
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                activeOpacity={0.7}
              >
                <Text style={styles.paginationButtonText}>Anterior</Text>
              </TouchableOpacity>

              <View style={styles.paginationNumbers}>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage === 1) {
                    pageNum = i + 1;
                  } else if (currentPage === totalPages) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  return (
                    <TouchableOpacity
                      key={pageNum}
                      style={[
                        styles.paginationNumber,
                        currentPage === pageNum && styles.paginationNumberActive,
                      ]}
                      onPress={() => setCurrentPage(pageNum)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.paginationNumberText,
                          currentPage === pageNum && styles.paginationNumberTextActive,
                        ]}
                      >
                        {pageNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.paginationButton,
                  currentPage === totalPages && styles.paginationButtonDisabled,
                ]}
                onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                activeOpacity={0.7}
              >
                <Text style={styles.paginationButtonText}>Próxima</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

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
                <Text style={styles.filterLabel}>Categoria</Text>
                {['Etapa Conta 01', 'Inicial', 'Em Andamento', 'Finalizada'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      selectedCategory === category && styles.filterOptionSelected,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedCategory === category && styles.filterOptionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Fluxo de Origem</Text>
                {['Fluxo Testes Gerais 001', 'teste091225'].map((workflow) => (
                  <TouchableOpacity
                    key={workflow}
                    style={[
                      styles.filterOption,
                      selectedWorkflow === workflow && styles.filterOptionSelected,
                    ]}
                    onPress={() => setSelectedWorkflow(workflow)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedWorkflow === workflow && styles.filterOptionTextSelected,
                      ]}
                    >
                      {workflow}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters} activeOpacity={0.7}>
                <Text style={styles.clearFiltersButtonText}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setFilterModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.applyFiltersButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </MainLayout>
  );
}
