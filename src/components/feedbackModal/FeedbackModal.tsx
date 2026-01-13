import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'created' | 'confirmed' | 'cancelled' | 'returned';
  taskName?: string;
  flowName?: string;
  stepName?: string;
  reason?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  type,
  taskName,
  flowName,
  stepName,
  reason,
}) => {
  const getConfig = () => {
    switch (type) {
      case 'created':
        return {
          icon: 'plus-circle-outline',
          iconColor: '#10b981',
          title: 'Atividade Criada com Sucesso!',
          message: `A atividade foi criada no fluxo ${flowName || ''}. Ela está agora disponível na etapa inicial e os responsáveis foram notificados automaticamente.`,
        };
      case 'confirmed':
        return {
          icon: 'check-circle-outline',
          iconColor: '#10b981',
          title: 'Atividade Confirmada!',
          message: stepName
            ? `A atividade foi confirmada e avançou para a etapa "${stepName}". Os novos responsáveis foram notificados.`
            : 'A atividade foi finalizada com sucesso.',
        };
      case 'cancelled':
        return {
          icon: 'close-circle-outline',
          iconColor: '#ef4444',
          title: 'Atividade Cancelada',
          message: 'A atividade foi cancelada permanentemente e não estará mais disponível para execução. O histórico permanece disponível para consulta.',
        };
      case 'returned':
        return {
          icon: 'undo-variant',
          iconColor: '#f59e0b',
          title: 'Atividade Retornada',
          message: stepName
            ? `A atividade voltou para a etapa "${stepName}" e os responsáveis foram notificados sobre o retorno.`
            : 'A atividade foi retornada para a etapa anterior.',
        };
      default:
        return {
          icon: 'information-outline',
          iconColor: '#4F6AF5',
          title: 'Ação Concluída',
          message: 'A ação foi executada com sucesso.',
        };
    }
  };

  const config = getConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}20` }]}>
            <MaterialCommunityIcons name={config.icon as any} size={64} color={config.iconColor} />
          </View>

          <Text style={styles.title}>{config.title}</Text>

          {taskName && (
            <Text style={styles.taskName}>{taskName}</Text>
          )}

          <Text style={styles.message}>{config.message}</Text>

          {reason && (
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Motivo:</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: config.iconColor }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F6AF5',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  reasonContainer: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
