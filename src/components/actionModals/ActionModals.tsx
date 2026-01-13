import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (description: string) => void;
  title: string;
  message: string;
  icon: string;
  iconColor: string;
  confirmText: string;
  confirmColor: string;
  requireDescription?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  iconColor,
  confirmText,
  confirmColor,
  requireDescription = false,
}) => {
  const [description, setDescription] = useState('');

  const handleConfirm = () => {
    if (requireDescription && !description.trim()) {
      return;
    }
    onConfirm(description.trim());
    setDescription('');
  };

  const handleClose = () => {
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <MaterialCommunityIcons name={icon as any} size={48} color={iconColor} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={requireDescription ? 'Descrição obrigatória...' : 'Descrição (opcional)...'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: confirmColor },
                requireDescription && !description.trim() && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={requireDescription && !description.trim()}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface SelectStepModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (stepId: number) => void;
  steps: Array<{ stepId: number; stepName: string; allowMov?: boolean }>;
  title?: string;
}

export const SelectStepModal: React.FC<SelectStepModalProps> = ({
  visible,
  onClose,
  onConfirm,
  steps,
  title = 'Selecione a Próxima Etapa',
}) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedStep !== null) {
      onConfirm(selectedStep);
      setSelectedStep(null);
    }
  };

  const handleClose = () => {
    setSelectedStep(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, { backgroundColor: '#4F6AF520' }]}>
            <MaterialCommunityIcons name="arrow-decision" size={48} color="#4F6AF5" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>
            Escolha para qual etapa a atividade deve avançar:
          </Text>

          <ScrollView style={styles.stepsContainer} showsVerticalScrollIndicator={false}>
            {steps.filter(step => step.allowMov !== false).map((step) => (
              <TouchableOpacity
                key={step.stepId}
                style={[
                  styles.stepOption,
                  selectedStep === step.stepId && styles.stepOptionSelected,
                ]}
                onPress={() => setSelectedStep(step.stepId)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.stepRadio,
                  selectedStep === step.stepId && styles.stepRadioSelected,
                ]}>
                  {selectedStep === step.stepId && <View style={styles.stepRadioDot} />}
                </View>
                <Text style={[
                  styles.stepName,
                  selectedStep === step.stepId && styles.stepNameSelected,
                ]}>
                  {step.stepName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: '#4F6AF5' },
                selectedStep === null && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={selectedStep === null}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '80%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#4F6AF5',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  stepsContainer: {
    maxHeight: 200,
    marginBottom: 20,
  },
  stepOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 8,
  },
  stepOptionSelected: {
    borderColor: '#4F6AF5',
    backgroundColor: '#eff6ff',
  },
  stepRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepRadioSelected: {
    borderColor: '#4F6AF5',
  },
  stepRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4F6AF5',
  },
  stepName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  stepNameSelected: {
    color: '#4F6AF5',
    fontWeight: '600',
  },
});
