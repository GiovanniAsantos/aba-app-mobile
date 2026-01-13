import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import InputCPF from '../input/InputCPFComponent';
import InputCNPJ from '../input/InputCNPJComponent';
import InputLink from '../input/InputLinkComponent';
import Calendar from '../calendar/CalendarComponent';
import Upload from '../upload/UploadComponent';
import { styles } from './style';

export interface DynamicField {
  name: string;
  label: string;
  type: 
    | 'text' 
    | 'textarea' 
    | 'number' 
    | 'currency' 
    | 'date' 
    | 'file' 
    | 'multiselect' 
    | 'select' 
    | 'url' 
    | 'phone' 
    | 'email' 
    | 'cpf' 
    | 'cnpj';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
  accept?: string;
  maxSize?: number;
}

interface CreateActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  dynamicFields?: DynamicField[];
  loading?: boolean;
  title?: string;
}

export default function CreateActivityModal({
  visible,
  onClose,
  onSubmit,
  dynamicFields = [],
  loading = false,
  title = 'Nova Atividade',
}: CreateActivityModalProps) {
  const [activityTitle, setActivityTitle] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleSubmit = async () => {
    if (!activityTitle.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const data = {
        title: activityTitle,
        ...fieldValues,
      };
      await onSubmit(data);
      handleClose();
    } catch (error) {
      console.error('Error creating activity:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActivityTitle('');
    setFieldValues({});
    onClose();
  };

  const renderField = (field: DynamicField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={fieldValues[field.name] || ''}
              onChangeText={(value) => handleFieldChange(field.name, value)}
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );

      case 'number':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={fieldValues[field.name]?.toString() || ''}
              onChangeText={(value) => handleFieldChange(field.name, value.replace(/\D/g, ''))}
              placeholder={field.placeholder}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        );

      case 'currency':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.currencyContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={[styles.input, styles.currencyInput]}
                value={fieldValues[field.name] ? formatCurrency(fieldValues[field.name]) : ''}
                onChangeText={(value) => handleFieldChange(field.name, value.replace(/\D/g, ''))}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'date':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <Calendar
              value={fieldValues[field.name] || ''}
              onChange={(value) => handleFieldChange(field.name, value)}
            />
          </View>
        );

      case 'file':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <Upload
              onFileSelect={(file) => handleFieldChange(field.name, file)}
            />
          </View>
        );

      case 'multiselect':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option) => {
                const selectedValues = fieldValues[field.name] || [];
                const isSelected = selectedValues.includes(option.value);
                
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.multiselectOption,
                      isSelected && styles.multiselectOptionActive,
                    ]}
                    onPress={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((v: any) => v !== option.value)
                        : [...selectedValues, option.value];
                      handleFieldChange(field.name, newValues);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxActive,
                    ]}>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.multiselectOptionText,
                        isSelected && styles.multiselectOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'select':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.selectContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    fieldValues[field.name] === option.value && styles.selectOptionActive,
                  ]}
                  onPress={() => handleFieldChange(field.name, option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      fieldValues[field.name] === option.value && styles.selectOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'url':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <InputLink
              value={fieldValues[field.name] || ''}
              onChangeText={(value) => handleFieldChange(field.name, value)}
            />
          </View>
        );

      case 'phone':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={fieldValues[field.name] ? formatPhone(fieldValues[field.name]) : ''}
              onChangeText={(value) => handleFieldChange(field.name, value.replace(/\D/g, ''))}
              placeholder={field.placeholder || '(00) 00000-0000'}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>
        );

      case 'email':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={fieldValues[field.name] || ''}
              onChangeText={(value) => handleFieldChange(field.name, value)}
              placeholder={field.placeholder || 'email@exemplo.com'}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        );

      case 'cpf':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <InputCPF
              value={fieldValues[field.name] || ''}
              onChangeText={(value) => handleFieldChange(field.name, value)}
            />
          </View>
        );

      case 'cnpj':
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <InputCNPJ
              value={fieldValues[field.name] || ''}
              onChangeText={(value) => handleFieldChange(field.name, value)}
            />
          </View>
        );

      case 'text':
      default:
        return (
          <View key={field.name} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TextInput
              style={styles.input}
              value={fieldValues[field.name] || ''}
              onChangeText={(value) => handleFieldChange(field.name, value)}
              placeholder={field.placeholder}
              placeholderTextColor="#999"
            />
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <MaterialCommunityIcons name="plus-circle" size={24} color="#4F6AF5" />
              </View>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={styles.loadingText}>Carregando campos...</Text>
              </View>
            ) : (
              <>
                {/* Título da Atividade - Campo fixo */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    Título da Atividade
                    <Text style={styles.required}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={activityTitle}
                    onChangeText={setActivityTitle}
                    placeholder="Digite o título da atividade"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Campos Dinâmicos */}
                {dynamicFields.map((field) => renderField(field))}
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!activityTitle.trim() || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!activityTitle.trim() || submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Criar Atividade</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
