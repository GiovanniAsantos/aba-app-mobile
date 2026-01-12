import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout } from '@/components';
import { styles } from './style';

type Workflow = {
  id: string;
  name: string;
  category: string;
  progress: number;
  icon: string;
  color: string;
};

const workflows: Workflow[] = [
  { id: "1", name: "Fluxo Email", category: "Marketing", progress: 100, icon: "email", color: "#ef4444" },
  { id: "2", name: "fluxo teste 060126", category: "Teste", progress: 50, icon: "cog", color: "#f97316" },
  { id: "3", name: "Fluxo Administrativo", category: "Admin", progress: 50, icon: "file-tree", color: "#3b82f6" },
  { id: "4", name: "Fluxo de novas Contratações", category: "RH", progress: 100, icon: "cart", color: "#8b5cf6" },
  { id: "5", name: "Fluxo Testes Gerais 001", category: "Teste", progress: 100, icon: "cog", color: "#ef4444" },
  { id: "6", name: "teste091225", category: "Teste", progress: 100, icon: "cog", color: "#22c55e" },
  { id: "7", name: "Fluxo 002", category: "Operacional", progress: 100, icon: "file-tree", color: "#3b82f6" },
  { id: "8", name: "Fluxo 02", category: "Operacional", progress: 50, icon: "file-tree", color: "#3b82f6" },
  { id: "9", name: "Fluxo 0001", category: "Geral", progress: 100, icon: "file-document", color: "#3b82f6" },
  { id: "10", name: "Aquisição de Material", category: "Compras", progress: 100, icon: "cart", color: "#ec4899" },
];

export default function FluxosScreen({ navigation }: NavigationProps<'Fluxos'>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const categories = ['all', ...Array.from(new Set(workflows.map((w) => w.category)))];

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWorkflows = filteredWorkflows.slice(startIndex, startIndex + itemsPerPage);

  const getIconName = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      email: 'email',
      cog: 'cog',
      'file-tree': 'file-tree',
      cart: 'cart',
      'file-document': 'file-document',
    };
    return iconMap[iconName] || 'file-document';
  };

  const renderWorkflowCard = ({ item: workflow }: { item: Workflow }) => (
    <TouchableOpacity
      style={[
        styles.workflowCard,
        { backgroundColor: `${workflow.color}15`, borderColor: `${workflow.color}40` },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIconWrapper}>
            <View style={styles.cardIconContainer}>
              <MaterialCommunityIcons name={getIconName(workflow.icon) as any} size={20} color="#1a1a1a" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{workflow.name}</Text>
              <Text style={styles.cardCategory}>{workflow.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso</Text>
            <Text style={styles.progressValue}>{workflow.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${workflow.progress}%`, backgroundColor: workflow.color },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWorkflowList = ({ item: workflow }: { item: Workflow }) => (
    <TouchableOpacity
      style={[
        styles.workflowListItem,
        { backgroundColor: `${workflow.color}15`, borderColor: `${workflow.color}40` },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listIconContainer}>
          <MaterialCommunityIcons name={getIconName(workflow.icon) as any} size={20} color="#1a1a1a" />
        </View>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemTitle} numberOfLines={1}>{workflow.name}</Text>
          <Text style={styles.listItemCategory}>{workflow.category}</Text>
          <View style={styles.listProgressContainer}>
            <View style={styles.listProgressBar}>
              <View
                style={[
                  styles.listProgressFill,
                  { width: `${workflow.progress}%`, backgroundColor: workflow.color },
                ]}
              />
            </View>
            <Text style={styles.listProgressText}>{workflow.progress}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <View style={styles.fluxosContainer}>
      
      {/* Header */}
      <View style={styles.fluxosHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="file-tree" size={20} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Fluxos</Text>
            <Text style={styles.headerSubtitle}>{filteredWorkflows.length} fluxos</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={20}
            color="#1a1a1a"
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.fluxosContent} showsVerticalScrollIndicator={false}>
        {/* Search & Filters */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar fluxos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.filterButtonsRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="filter-variant" size={16} color="#1a1a1a" />
              <Text style={styles.filterButtonText}>Filtros</Text>
              {categoryFilter !== 'all' && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.newFlowButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={styles.newFlowButtonText}>Novo Fluxo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workflows Grid/List */}
        {viewMode === 'grid' ? (
          <View style={styles.workflowsGrid}>
            {paginatedWorkflows.map((workflow) => (
              <View key={workflow.id} style={styles.gridItemWrapper}>
                {renderWorkflowCard({ item: workflow })}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.workflowsList}>
            {paginatedWorkflows.map((workflow) => (
              <View key={workflow.id}>
                {renderWorkflowList({ item: workflow })}
              </View>
            ))}
          </View>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              activeOpacity={0.7}
            >
              <Text style={styles.paginationButtonText}>Anterior</Text>
            </TouchableOpacity>

            <View style={styles.paginationNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <TouchableOpacity
                  key={page}
                  style={[
                    styles.paginationNumber,
                    currentPage === page && styles.paginationNumberActive,
                  ]}
                  onPress={() => setCurrentPage(page)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.paginationNumberText,
                      currentPage === page && styles.paginationNumberTextActive,
                    ]}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled,
              ]}
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              activeOpacity={0.7}
            >
              <Text style={styles.paginationButtonText}>Próxima</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar fluxos</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>Selecione uma categoria para filtrar</Text>
            
            <ScrollView style={styles.modalCategories}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    categoryFilter === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => {
                    setCategoryFilter(category);
                    setCurrentPage(1);
                    setFilterModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      categoryFilter === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category === 'all' ? 'Todas as categorias' : category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </MainLayout>
  );
}
