import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './styles';

interface RuleSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRule: (ruleId: number | null) => void;
  currentRuleId: number | null;
}

const RULES = [
  {
    id: null,
    name: 'Sem regra',
    description: 'Participantes podem assinar em qualquer ordem',
    icon: 'cancel',
  },
  {
    id: 1,
    name: 'Assinatura Simples',
    description: 'Todos assinam individualmente, sem ordem específica',
    icon: 'account-check',
  },
  {
    id: 2,
    name: 'Assinatura em Paralelo',
    description: 'Todos do grupo assinam ao mesmo tempo',
    icon: 'account-multiple-check',
  },
  {
    id: 3,
    name: 'Assinatura em Sequência',
    description: 'Cada participante assina após o anterior',
    icon: 'order-numeric-ascending',
  },
];

export function RuleSelectModal({
  visible,
  onClose,
  onSelectRule,
  currentRuleId,
}: RuleSelectModalProps) {
  const handleSelect = (ruleId: number | null) => {
    onSelectRule(ruleId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Regra do Grupo</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {RULES.map((rule) => (
              <TouchableOpacity
                key={rule.id}
                style={[
                  styles.ruleCard,
                  currentRuleId === rule.id && styles.ruleCardSelected,
                ]}
                onPress={() => handleSelect(rule.id)}
              >
                <View style={styles.ruleIconContainer}>
                  <MaterialCommunityIcons
                    name={rule.icon as any}
                    size={32}
                    color={currentRuleId === rule.id ? '#4F6AF5' : '#666'}
                  />
                </View>
                <View style={styles.ruleInfo}>
                  <Text style={styles.ruleName}>{rule.name}</Text>
                  <Text style={styles.ruleDescription}>{rule.description}</Text>
                </View>
                {currentRuleId === rule.id && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color="#4F6AF5"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
