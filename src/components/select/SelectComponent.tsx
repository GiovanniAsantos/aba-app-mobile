import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './style';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

export default function Select({
  label,
  required = false,
  placeholder = 'Selecione uma opção',
  value,
  options,
  onChange,
  error,
  helperText,
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getContainerStyle = () => {
    const containerStyles: any[] = [styles.selectContainer];
    if (error) containerStyles.push(styles.selectError);
    if (disabled) containerStyles.push(styles.selectDisabled);
    return containerStyles;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={getContainerStyle()}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <View style={styles.selectButton}>
          <Text
            style={[
              styles.selectText,
              !selectedOption && styles.selectPlaceholder,
              disabled && styles.selectDisabledText,
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={disabled ? '#9ca3af' : '#6b7280'}
          />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}

      <Modal visible={isOpen} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Selecione'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    option.value === value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
