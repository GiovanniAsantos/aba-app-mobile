import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import type { TaskModalDetailsV2 } from '@/types/taskModal';

interface OverviewTabProps {
  taskDetails: TaskModalDetailsV2 | null;
  formatDate: (dateString: string) => string;
  getPriorityConfig: (priority?: string) => {
    bg: string;
    color: string;
    label: string;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  taskDetails,
  formatDate,
  getPriorityConfig,
}) => {
  if (!taskDetails) {
    return (
      <View style={styles.emptyHistory}>
        <ActivityIndicator size="large" color="#4F6AF5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações da Tarefa</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nome</Text>
          <Text style={styles.infoValue}>{taskDetails.task?.name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Protocolo</Text>
          <Text style={styles.infoValue}>{taskDetails.task?.protocol || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fluxo</Text>
          <Text style={styles.infoValue}>{taskDetails.flow?.name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Etapa Atual</Text>
          <Text style={styles.infoValue}>{taskDetails.flow?.currentStep?.name || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Criada em</Text>
          <Text style={styles.infoValue}>
            {taskDetails.task?.createdAt ? formatDate(taskDetails.task.createdAt) : 'N/A'}
          </Text>
        </View>
      </View>

      {taskDetails.flow?.movsEnabled && taskDetails.flow.movsEnabled.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Etapas Disponíveis</Text>
          {taskDetails.flow.movsEnabled
            .filter((step) => step.allowMov)
            .map((step, index) => (
              <View
                key={`next-step-${step.stepId}-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#4F6AF5',
                    marginRight: 10,
                  }}
                />
                <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>{step.stepName}</Text>
              </View>
            ))}
        </View>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};
