import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { apiBpmsUrlV1, apiCloudUrl } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import type { TaskModalDetailsV2 } from '@/types/taskModal';
import type { TaskFormField } from '@/types/bpms';
import { FieldRenderer } from '../fieldRenderer/FieldRenderer';
import { ActionModal, SelectStepModal } from '../actionModals/ActionModals';
import { FeedbackModal } from '../feedbackModal/FeedbackModal';
import { OverviewTab, FormTab, HistoryTab } from './tabs';

interface TaskModalProps {
  visible: boolean;
  taskId: number | null;
  onClose: () => void;
  onRefresh?: () => void;
}

type TabType = 'overview' | 'form' | 'history';

const TaskModal = ({ visible, taskId, onClose, onRefresh }: TaskModalProps) => {
  const { tokens } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const [taskDetails, setTaskDetails] = useState<TaskModalDetailsV2 | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Estados para modais de ação
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showSelectStepModal, setShowSelectStepModal] = useState(false);

  // Estados para modal de feedback
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    type: 'created' | 'confirmed' | 'cancelled' | 'returned';
    taskName?: string;
    flowName?: string;
    stepName?: string;
    reason?: string;
  }>({
    visible: false,
    type: 'confirmed',
  });

  // Função para fazer download/visualizar arquivo do cloud
  const handleDownloadFile = async (cloudUuid?: string, key?: string, fileName?: string) => {
    if (!cloudUuid && !key) {
      Alert.alert('Erro', 'Arquivo não disponível para download');
      return;
    }

    try {
      const identifier = cloudUuid || key;
      const downloadUrl = `${apiCloudUrl}/download/${identifier}`;
      
      const supported = await Linking.canOpenURL(downloadUrl);
      if (supported) {
        await Linking.openURL(downloadUrl);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o arquivo');
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      Alert.alert('Erro', 'Falha ao fazer download do arquivo');
    }
  };


  const loadTaskDetails = useCallback(async () => {
    if (!tokens?.accessToken || !taskId) return;

    setLoading(true);

    try {
      const response = await fetch(`${apiBpmsUrlV1}/tasks/${taskId}/v2`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setTaskDetails(data);

      // Inicializar formData com valores existentes dos campos do formulário
      if (data.form?.stepsFields) {
        const initialFormData: Record<string, any> = {};
        data.form.stepsFields.forEach((field: any) => {
          const fieldId = field.stepFieldId;
          initialFormData[fieldId] = field.response || '';
        });
        setFormData(initialFormData);
      }

      // Selecionar primeiro step disponível
      if (data.flow?.movsEnabled && data.flow.movsEnabled.length > 0) {
        const firstEnabledStep = data.flow.movsEnabled.find((step: any) => step.allowMov);
        if (firstEnabledStep) {
          setSelectedStep(firstEnabledStep.stepId);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes da tarefa:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da tarefa');
    } finally {
      setLoading(false);
    }
  }, [tokens?.accessToken, taskId]);


  useEffect(() => {
    if (visible && taskId) {
      loadTaskDetails();
    } else if (!visible) {
      // Reset ao fechar
      setTaskDetails(null);
      setFormData({});
      setActiveTab('overview');
    }
  }, [visible, taskId, loadTaskDetails]);

  // Função para validar campos obrigatórios
  const validateRequiredFields = (): { valid: boolean; missingFields: string[] } => {
    const fields = taskDetails?.form?.stepsFields || [];
    const missingFields: string[] = [];

    fields.forEach((field) => {
      if (field.notNull) {
        const fieldId = field.stepFieldId;
        const value = formData[fieldId];

        // Verificar se o campo está vazio
        if (value === undefined || value === null || value === '') {
          missingFields.push(field.name);
        } else if (Array.isArray(value) && value.length === 0) {
          missingFields.push(field.name);
        }
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  };

  const execAction = async (actionType: 'TASK_ACCEPTED' | 'INFO_INSERTED' | 'TASK_RETURNED' | 'TASK_CLOSED', description?: string) => {
    if (!tokens?.accessToken || !taskId || !taskDetails) return;

    setLoadingAction(true);
    try {
      const allFields = taskDetails.form?.stepsFields || [];
      const targetStepId = selectedStep || taskDetails.flow?.movsEnabled?.[0]?.stepId || 0;

      const currentStep = taskDetails.flow?.currentStep;
      // Verifica se o usuário atual é validador de campo (não implementado no app ainda)
      const isFieldValidator = false; // TODO: implementar verificação

      const finalActionType = isFieldValidator && actionType === 'TASK_ACCEPTED' ? 'INFO_INSERTED' : actionType;

      const reqsWithId: Array<{ FieldId: number; Values: string[] }> = [];
      const files: Array<{ file: any; name: string }> = [];

      // Processa campos do formulário
      for (const field of allFields) {
        const fieldId = field.stepFieldId;
        const value = formData[fieldId];

        if (value === undefined || value === null || value === '') {
          continue;
        }

        // Trata diferentes tipos de campo
        if (field.type === 'DATE') {
          // Formato dd/mm/yyyy
          const date = new Date(value);
          const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          reqsWithId.push({
            FieldId: parseInt(String(fieldId)),
            Values: [formattedDate],
          });
        } else if (field.type === 'DATETIME' || field.type === 'DATE_TIME') {
          const date = new Date(value);
          const formattedDateTime = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
          reqsWithId.push({
            FieldId: parseInt(String(fieldId)),
            Values: [formattedDateTime],
          });
        } else if (field.type === 'MULTIPLE_CHOICE') {
          // MULTIPLE_CHOICE: enviar como array de strings
          const values = typeof value === 'string' 
            ? value.split(',').map((v: string) => v.trim()).filter(Boolean)
            : Array.isArray(value) ? value : [value];
          reqsWithId.push({
            FieldId: parseInt(String(fieldId)),
            Values: values,
          });
        } else if (field.type === 'ONLY_CHOICE') {
          reqsWithId.push({
            FieldId: parseInt(String(fieldId)),
            Values: [String(value)],
          });
        } else if (field.type === 'ATTACHMENT') {
          // ATTACHMENT: se for objeto, adiciona ao FormData e envia apenas o nome
          if (typeof value === 'object' && value.uri) {
            // Arquivo do DocumentPicker
            files.push({
              file: {
                uri: value.uri,
                type: value.mimeType || 'application/octet-stream',
                name: value.name,
              },
              name: value.name,
            });
            reqsWithId.push({
              FieldId: parseInt(String(fieldId)),
              Values: [value.name],
            });
          } else if (typeof value === 'string') {
            // Apenas nome do arquivo
            reqsWithId.push({
              FieldId: parseInt(String(fieldId)),
              Values: [value],
            });
          }
        } else {
          // Outros campos: sempre string
          reqsWithId.push({
            FieldId: parseInt(String(fieldId)),
            Values: [String(value)],
          });
        }
      }

      const request = {
        TaskId: taskDetails.task.taskId,
        GoToStep: targetStepId,
        TypeAction: finalActionType,
        Description: description || '',
        Fields: reqsWithId,
      };

      const formDataToSend = new FormData();

      // Adiciona arquivos se houver
      files.forEach((fileInfo) => {
        formDataToSend.append('files', fileInfo.file as any);
      });

      // Adiciona o request como JSON string
      formDataToSend.append('request', JSON.stringify(request));

      console.log('📤 Enviando ação:', finalActionType, 'para step:', targetStepId);

      const response = await fetch(`${apiBpmsUrlV1}/steps-tasks-actions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Ação executada com sucesso:', responseData);

      // Obter nome da próxima etapa
      const nextStep = taskDetails.flow?.movsEnabled?.find(s => s.stepId === targetStepId);

      // Mostrar modal de feedback
      setFeedbackModal({
        visible: true,
        type: 'confirmed',
        taskName: taskDetails.task?.name,
        stepName: nextStep?.stepName,
      });

      onClose();
      if (onRefresh) onRefresh();

      // TODO: Verificar se próxima etapa é SIGNATURE e abrir modal de assinatura
      const stepFromResponse = responseData?.content;
      const isSignatureStep = stepFromResponse?.typeFinalStep === 'SIGNATURE';
      if (isSignatureStep) {
        console.log('📝 Próxima etapa é de assinatura');
        // Implementar navegação para assinatura
      }
    } catch (error: any) {
      console.error('❌ Erro ao executar ação:', error);
      Alert.alert('Erro', error.message || 'Não foi possível executar a ação');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAcceptTask = () => {
    // Validar campos obrigatórios
    const validation = validateRequiredFields();
    if (!validation.valid) {
      Alert.alert(
        'Campos Obrigatórios',
        `Os seguintes campos precisam ser preenchidos:\n\n${validation.missingFields.join('\n')}`,
        [{ text: 'OK' }]
      );
      setActiveTab('form'); // Mudar para aba de formulário
      return;
    }

    // Verificar se há múltiplas etapas disponíveis (permitidas para movimentação)
    const availableSteps = taskDetails?.flow?.movsEnabled?.filter(step => step.allowMov) || [];
    if (availableSteps.length > 1) {
      setShowSelectStepModal(true);
    } else if (availableSteps.length === 1) {
      // Se só há uma etapa, seleciona ela automaticamente
      setSelectedStep(availableSteps[0].stepId);
      execAction('TASK_ACCEPTED');
    } else {
      // Confirmar diretamente se não houver etapas configuradas
      execAction('TASK_ACCEPTED');
    }
  };

  const handleConfirmWithStep = (stepId: number) => {
    setSelectedStep(stepId);
    setShowSelectStepModal(false);
    setTimeout(() => {
      execAction('TASK_ACCEPTED');
    }, 100);
  };

  const handleReturnTask = useCallback(() => {
    setShowReturnModal(true);
  }, []);

  const handleCancelTask = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmReturn = async (description: string) => {
    setShowReturnModal(false);
    console.log('↩️ Devolvendo tarefa:', taskId, 'com descrição:', description);
    
    try {
      await execAction('TASK_RETURNED', description);
      
      setFeedbackModal({
        visible: true,
        type: 'returned',
        taskName: taskDetails?.task?.name,
        stepName: taskDetails?.flow?.currentStep?.name,
        reason: description,
      });
    } catch (error) {
      console.error('❌ Erro ao devolver tarefa:', error);
    }
  };

  const handleConfirmCancel = async (description: string) => {
    setShowCancelModal(false);
    console.log('🚫 Cancelando tarefa:', taskId, 'com descrição:', description);
    
    try {
      await execAction('TASK_CLOSED', description);
      
      setFeedbackModal({
        visible: true,
        type: 'cancelled',
        taskName: taskDetails?.task?.name,
        reason: description,
      });
    } catch (error) {
      console.error('❌ Erro ao cancelar tarefa:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityConfig = (priority?: string) => {
    const config = {
      URGENT: { bg: '#fee2e2', color: '#dc2626', label: 'Urgente' },
      HIGH: { bg: '#fed7aa', color: '#ea580c', label: 'Alta' },
      MEDIUM: { bg: '#fef3c7', color: '#d97706', label: 'Média' },
      LOW: { bg: '#dbeafe', color: '#2563eb', label: 'Baixa' },
    };
    return config[priority as keyof typeof config] || config.MEDIUM;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {taskDetails?.task?.name || 'Detalhes da Tarefa'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}
              >
                Visão Geral
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'form' && styles.activeTab]}
              onPress={() => setActiveTab('form')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}
              >
                Formulário
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}
              >
                Histórico
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
              </View>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab 
                    taskDetails={taskDetails}
                    formatDate={formatDate}
                    getPriorityConfig={getPriorityConfig}
                  />
                )}
                {activeTab === 'form' && (
                  <FormTab 
                    taskDetails={taskDetails}
                    formData={formData}
                    setFormData={setFormData}
                    tokens={tokens || undefined}
                  />
                )}
                {activeTab === 'history' && (
                  <HistoryTab 
                    taskDetails={taskDetails}
                    handleDownloadFile={handleDownloadFile}
                  />
                )}
              </>
            )}
          </View>

          {/* Actions Footer */}
          {taskDetails && !loading && (() => {
            const currentStep = taskDetails.flow?.currentStep;
            const showConfirm = taskDetails.task?.exec?.execConfirmed === true;
            const showReturn = currentStep && !currentStep.initialStep && !currentStep.finalStep;
            const showCancel = taskDetails.task?.exec?.execCancelled === true;

            // Se não há ações disponíveis, não renderiza o footer
            if (!showConfirm && !showReturn && !showCancel) {
              return null;
            }

            return (
              <View style={styles.actionsFooter}>
                {showReturn && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleReturnTask}
                    activeOpacity={0.8}
                    disabled={loadingAction}
                  >
                    <MaterialCommunityIcons name="undo" size={18} color="#1a1a1a" />
                    <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                      Retornar
                    </Text>
                  </TouchableOpacity>
                )}

                {showCancel && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={handleCancelTask}
                    activeOpacity={0.8}
                    disabled={loadingAction}
                  >
                    <MaterialCommunityIcons name="close-circle" size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                )}

                {showConfirm && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleAcceptTask}
                    activeOpacity={0.8}
                    disabled={loadingAction || !selectedStep}
                  >
                    {loadingAction ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                          Confirmar
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })()}
        </View>
      </View>

      {/* Modais de Ação */}
      <ActionModal
        visible={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        onConfirm={handleConfirmReturn}
        title="Retornar Atividade"
        message="A atividade será retornada para a etapa anterior. Descreva o motivo do retorno:"
        icon="undo-variant"
        iconColor="#f59e0b"
        confirmText="Retornar"
        confirmColor="#f59e0b"
        requireDescription={true}
      />

      <ActionModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="Cancelar Atividade"
        message="Esta ação é irreversível. A atividade será cancelada permanentemente. Descreva o motivo:"
        icon="close-circle-outline"
        iconColor="#ef4444"
        confirmText="Cancelar Atividade"
        confirmColor="#ef4444"
        requireDescription={true}
      />

      <SelectStepModal
        visible={showSelectStepModal}
        onClose={() => setShowSelectStepModal(false)}
        onConfirm={handleConfirmWithStep}
        steps={taskDetails?.flow?.movsEnabled || []}
        title="Selecione a Próxima Etapa"
      />

      <FeedbackModal
        visible={feedbackModal.visible}
        onClose={() => {
          setFeedbackModal({ ...feedbackModal, visible: false });
        }}
        type={feedbackModal.type}
        taskName={feedbackModal.taskName}
        flowName={feedbackModal.flowName}
        stepName={feedbackModal.stepName}
        reason={feedbackModal.reason}
      />
    </Modal>
  );
};

export default TaskModal;
