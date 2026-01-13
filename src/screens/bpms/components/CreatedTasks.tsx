import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BpmsTask, BpmsTasksResponse } from '../../../types/bpms';
import { apiBpmsUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import { styles } from '../style';
import { TaskModal } from '@/components/taskModal';

interface CreatedTasksProps {
  onCreateTaskPress: () => void;
  searchQuery: string;
  selectedCategory: string;
  selectedWorkflow: string;
}

export const CreatedTasks: React.FC<CreatedTasksProps> = ({
  onCreateTaskPress,
  searchQuery,
  selectedCategory,
  selectedWorkflow,
}) => {
  const { tokens } = useAuth();
  const [activities, setActivities] = useState<BpmsTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadActivities();
  }, [currentPage, searchQuery, selectedCategory, selectedWorkflow]);

  const loadActivities = async () => {
    if (!tokens?.accessToken) return;

    setLoading(true);
    console.log(`🔄 Carregando atividades criadas - Página: ${currentPage}`);

    try {
      const params = new URLSearchParams({
        page: String(currentPage - 1),
        limit: String(itemsPerPage),
        orderBy: 'createdAt',
        direction: 'DESC',
      });

      if (searchQuery) params.append('taskName', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);

      const response = await fetch(`${apiBpmsUrlV1}/tasks/me?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: BpmsTasksResponse = await response.json();
      console.log('✅ Atividades criadas carregadas:', {
        quantidade: data.content.length,
        total: data.totalRecords,
      });

      setActivities(data.content);
      setTotalRecords(data.totalRecords);
    } catch (error) {
      console.error('❌ Erro ao carregar atividades criadas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as atividades criadas');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activity: BpmsTask) => {
    if (activity.flowIconPath) {
      return (
        <Image
          source={{ uri: activity.flowIconPath }}
          style={{
            width: 20,
            height: 20,
            tintColor: activity.flowColor || "#4F6AF5",
          }}
          resizeMode="contain"
        />
      );
    }

    return (
      <MaterialCommunityIcons
        name="cog"
        size={20}
        color={activity.flowColor || "#4F6AF5"}
      />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleTaskPress = (taskId: number) => {
    setSelectedTaskId(taskId);
    setTaskModalVisible(true);
  };

  const handleTaskModalClose = () => {
    setTaskModalVisible(false);
    setSelectedTaskId(null);
  };

  const handleRefresh = () => {
    loadActivities();
  };

  const renderActivity = (activity: BpmsTask) => (
    <TouchableOpacity
      key={activity.taskId}
      style={styles.activityCard}
      activeOpacity={0.7}
      onPress={() => handleTaskPress(activity.taskId)}
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
            {activity.sla && activity.sla.isDelayed && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Atrasado</Text>
              </View>
            )}
          </View>
          <Text style={styles.activityWorkflow} numberOfLines={1}>
            {activity.flowName}
          </Text>
        </View>
      </View>

      <View style={styles.activityBadges}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: activity.currentStepColor + '20',
              borderColor: activity.currentStepColor + '60',
            },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: activity.currentStepColor }]}>
            {activity.protocol}
          </Text>
        </View>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{activity.currentStepName}</Text>
        </View>
      </View>

      <View style={styles.activityDates}>
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="calendar" size={14} color="#6b7280" />
          <Text style={styles.dateText}>Criado: {formatDate(activity.createdAt)}</Text>
        </View>
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="update" size={14} color="#6b7280" />
          <Text style={styles.dateText}>Atualizado: {formatDate(activity.updatedAt)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.openActivityButton}
        activeOpacity={0.8}
        onPress={() => handleTaskPress(activity.taskId)}
      >
        <Text style={styles.openActivityButtonText}>Abrir Atividade</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Botão Criar Nova Atividade */}
      <View style={styles.createTaskButtonContainer}>
        <TouchableOpacity
          style={styles.createTaskButton}
          onPress={onCreateTaskPress}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
          <Text style={styles.createTaskButtonText}>Nova Atividade</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.activitiesList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#4F6AF5" />
            <Text style={styles.emptyStateText}>Carregando atividades...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyStateText}>Nenhuma atividade criada por você</Text>
            <Text style={styles.emptyStateSubtext}>
              Clique em "Nova Atividade" para começar
            </Text>
          </View>
        ) : (
          activities.map((activity) => renderActivity(activity))
        )}

        {/* Pagination */}
        {totalRecords > 0 && totalPages > 1 && !loading && (
          <View style={styles.activitiesPagination}>
            <Text style={styles.paginationInfo}>
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalRecords)} de {totalRecords}
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

        {/* Task Modal */}
        {selectedTaskId && (
          <TaskModal
            visible={taskModalVisible}
            taskId={selectedTaskId}
            onClose={handleTaskModalClose}
            onRefresh={handleRefresh}
          />
        )}
      </ScrollView>
    </>
  );
};
