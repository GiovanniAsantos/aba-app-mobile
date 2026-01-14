import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import type { BpmsFlow } from '../../types/bpms';
import { MainLayout } from '@/components';
import PageHeader from '@/components/layout/PageHeader';
import { FlowSelectionModal } from '@/components/flowSelectionModal';
import { CreateTaskModal } from '@/components/createTaskModal';
import { PendingTasks, CreatedTasks } from './components';
import { styles } from './style';

type ActivityType = 'pending' | 'created';

export default function MinhasAtividadesScreen({ navigation }: NavigationProps<'MinhasAtividades'>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [activeTab, setActiveTab] = useState<ActivityType>('pending');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [flowSelectionModalVisible, setFlowSelectionModalVisible] = useState(false);
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<BpmsFlow | null>(null);

  const hasActiveFilters = !!(selectedCategory || selectedWorkflow);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedWorkflow('');
    setSearchQuery('');
    setFilterModalVisible(false);
  };

  const handleCreateTaskPress = () => {
    setFlowSelectionModalVisible(true);
  };

  const handleSelectFlow = (flow: BpmsFlow) => {
    setFlowSelectionModalVisible(false);
    setSelectedFlow(flow);
    setCreateTaskModalVisible(true);
  };

  const handleCreateTaskSuccess = () => {
    setCreateTaskModalVisible(false);
    setSelectedFlow(null);
    // Forçar reload das atividades criadas
    if (activeTab === 'created') {
      // O componente CreatedTasks irá recarregar automaticamente
    }
  };

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <View style={styles.activitiesContainer}>

        {/* Page Header */}
        <PageHeader
          iconName="checkbox-marked-circle-outline"
          title="Minhas Atividades"
          subtitle="Gerencie suas tarefas e atividades"
          containerStyle={styles.pageHeaderContainer}
          titleStyle={styles.pageHeaderTitle}
          subtitleStyle={styles.pageHeaderSubtitle}
        />

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
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'created' && styles.activeTab]}
            onPress={() => setActiveTab('created')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
              Criadas por mim
            </Text>
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
          {/* Componentes de Tab */}
          {activeTab === 'pending' ? (
            <PendingTasks
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedWorkflow={selectedWorkflow}
            />
          ) : (
            <CreatedTasks
              onCreateTaskPress={handleCreateTaskPress}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              selectedWorkflow={selectedWorkflow}
            />
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

        {/* Flow Selection Modal */}
        <FlowSelectionModal
          visible={flowSelectionModalVisible}
          onClose={() => setFlowSelectionModalVisible(false)}
          onSelectFlow={handleSelectFlow}
        />

        {/* Create Task Modal */}
        <CreateTaskModal
          visible={createTaskModalVisible}
          selectedFlow={selectedFlow}
          onClose={() => {
            setCreateTaskModalVisible(false);
            setSelectedFlow(null);
          }}
          onSuccess={handleCreateTaskSuccess}
        />
      </View>
    </MainLayout>
  );
}