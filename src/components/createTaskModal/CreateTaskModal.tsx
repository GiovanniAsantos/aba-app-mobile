import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { styles } from './styles';
import { apiBpmsUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import type { BpmsFlow, TaskFormField } from '@/types/bpms';

interface CreateTaskModalProps {
  visible: boolean;
  selectedFlow: BpmsFlow | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  visible,
  selectedFlow,
  onClose,
  onSuccess,
}) => {
  const { tokens } = useAuth();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [taskName, setTaskName] = useState('');

  useEffect(() => {
    if (visible && selectedFlow) {
      // Inicializar formData com valores vazios
      const initialData: Record<string, any> = {};
      selectedFlow.formInitial?.fields.forEach((field) => {
        if (field.type === 'MULTIPLE_CHOICE') {
          initialData[field.name] = [];
        } else {
          initialData[field.name] = '';
        }
      });
      setFormData(initialData);
      setUploadedFiles({});
      setErrors({});
      setTaskName('');
    }
  }, [visible, selectedFlow]);

  // Heurística para detectar um campo do formulário que sirva como título
  const titleField = selectedFlow?.formInitial?.fields?.find((f) => {
    const label = (f.label || f.name || '').toLowerCase();
    return (
      ['título', 'titulo', 'title', 'nome da atividade', 'nome da tarefa'].some((k) => label.includes(k)) ||
      (f as any)?.isTitle === true ||
      (f as any)?.nameTask === true
    );
  });
  const hasTitleField = !!titleField;

  const validateField = (field: TaskFormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} é obrigatório`;
    }

    if (value && field.validation) {
      const { min, max, pattern } = field.validation;

      if (min && value.length < min) {
        return `${field.label} deve ter no mínimo ${min} caracteres`;
      }

      if (max && value.length > max) {
        return `${field.label} deve ter no máximo ${max} caracteres`;
      }

      if (pattern && !new RegExp(pattern).test(value)) {
        return field.validation.message || `${field.label} inválido`;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validar título quando não há campo de título no formulário
    if (!hasTitleField) {
      if (!taskName || taskName.trim().length === 0) {
        newErrors['taskName'] = 'Título é obrigatório';
        isValid = false;
      }
    }

    selectedFlow?.formInitial?.fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePickFile = async (fieldName: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('📎 Arquivo selecionado:', file.name);
        
        setUploadedFiles((prev) => ({
          ...prev,
          [fieldName]: file,
        }));
        
        setFormData((prev) => ({
          ...prev,
          [fieldName]: file.name,
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validação', 'Por favor, preencha todos os campos obrigatórios corretamente');
      return;
    }

    if (!tokens?.accessToken || !selectedFlow) return;

    setLoading(true);
    console.log('📤 Criando nova tarefa para o fluxo:', selectedFlow.name);

    try {
      const fd = new FormData();

      // Helpers de formatação para compatibilidade com a API
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const formatDateDDMMYYYY = (input: any): string => {
        if (!input) return '';
        if (typeof input === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(input)) return input;
        const d = new Date(input);
        if (isNaN(d.getTime())) return '';
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      };
      const formatDateTimeDDMMYYYY_HHMMSS = (input: any): string => {
        if (!input) return '';
        const d = new Date(input);
        if (isNaN(d.getTime())) return '';
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };

      // Nome (Name) conforme regra: null se houver campo de título no formulário
      const nameToSend = hasTitleField && titleField
        ? (formData[titleField.name] || '').toString().trim()
        : taskName.trim();

      // Monte Fields seguindo o padrão { FieldId, Values: string[] }
      const filledEntries = Object.entries(formData).filter(([_, v]) => {
        if (v === undefined || v === null) return false;
        if (typeof v === 'string') return v.trim().length > 0;
        if (Array.isArray(v)) return v.length > 0;
        return true;
      });

      const reqsWithId: Array<{ FieldId: number; Values: string[] }> = [];

      selectedFlow.formInitial?.fields.forEach((f) => {
        const fieldId = (f.stepFieldId ?? f.initialFieldId) as number | undefined;
        if (!fieldId) return;
        const entry = filledEntries.find(([k]) => k === f.name);
        const value = entry ? entry[1] : undefined;

        if (f.type === 'ATTACHMENT') {
          const file = uploadedFiles[f.name];
          if (file && file.uri) {
            // Anexa arquivo em "files" e envia Values vazio
            const filePart: any = {
              uri: file.uri,
              name: file.name || 'file',
              type: file.mimeType || 'application/octet-stream',
            };
            fd.append('files', filePart as any);
            reqsWithId.push({ FieldId: fieldId, Values: [] });
          }
          return;
        }

        if (value === undefined) return;

        if (f.type === 'DATE') {
          const formatted = formatDateDDMMYYYY(value);
          if (formatted) reqsWithId.push({ FieldId: fieldId, Values: [formatted] });
          return;
        }

        if (f.type === 'DATETIME' || f.type === 'DATE_TIME') {
          const formatted = formatDateTimeDDMMYYYY_HHMMSS(value);
          if (formatted) reqsWithId.push({ FieldId: fieldId, Values: [formatted] });
          return;
        }

        if (f.type === 'MULTIPLE_CHOICE') {
          const arr = Array.isArray(value) ? value : value ? [value] : [];
          if (arr.length > 0) reqsWithId.push({ FieldId: fieldId, Values: arr.map((v: any) => String(v)) });
          return;
        }

        if (f.type === 'ONLY_CHOICE') {
          reqsWithId.push({ FieldId: fieldId, Values: [String(value)] });
          return;
        }

        // Demais tipos: enviar como string simples
        reqsWithId.push({ FieldId: fieldId, Values: [String(value)] });
      });

      const requestPayload = {
        Name: hasTitleField ? null : nameToSend,
        FlowId: selectedFlow.flowId,
        Fields: reqsWithId,
      };

      fd.append('request', JSON.stringify(requestPayload));

      const response = await fetch(`${apiBpmsUrlV1}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: fd,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tarefa criada com sucesso:', data);

      Alert.alert('Sucesso', 'Tarefa criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Erro ao criar tarefa:', error);
      Alert.alert('Erro', error.message || 'Não foi possível criar a tarefa');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: TaskFormField) => {
    const value = formData[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'LINK':
      case 'TELEPHONE':
      case 'CPF':
      case 'CNPJ':
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <TextInput
              style={[styles.textInput, error && styles.inputError]}
              placeholder={field.placeholder || `Digite ${(field.label || field.name).toLowerCase()}`}
              value={value || ''}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, [field.name]: text }));
                if (error) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field.name];
                    return newErrors;
                  });
                }
              }}
              keyboardType={
                field.type === 'EMAIL'
                  ? 'email-address'
                  : field.type === 'TELEPHONE'
                  ? 'phone-pad'
                  : 'default'
              }
              placeholderTextColor="#9ca3af"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'TEXT_AREA':
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea, error && styles.inputError]}
              placeholder={field.placeholder || `Digite ${(field.label || field.name).toLowerCase()}`}
              value={value || ''}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, [field.name]: text }));
                if (error) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field.name];
                    return newErrors;
                  });
                }
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'NUMBER':
      case 'COIN':
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <TextInput
              style={[styles.textInput, error && styles.inputError]}
              placeholder={field.placeholder || `Digite ${(field.label || field.name).toLowerCase()}`}
              value={value || ''}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, [field.name]: text }));
                if (error) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field.name];
                    return newErrors;
                  });
                }
              }}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'DATE':
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <TextInput
              style={[styles.textInput, error && styles.inputError]}
              placeholder="DD/MM/AAAA"
              value={value || ''}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, [field.name]: text }));
                if (error) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[field.name];
                    return newErrors;
                  });
                }
              }}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#9ca3af"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'ONLY_CHOICE':
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            {field.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => {
                  setFormData((prev) => ({ ...prev, [field.name]: option.value }));
                  if (error) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors[field.name];
                      return newErrors;
                    });
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radio,
                    value === option.value && styles.radioSelected,
                  ]}
                >
                  {value === option.value && (
                    <MaterialCommunityIcons name="check" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'MULTIPLE_CHOICE':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            {field.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.checkboxContainer}
                  onPress={() => {
                    const newValues = isSelected
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value];
                    setFormData((prev) => ({ ...prev, [field.name]: newValues }));
                    if (error) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors[field.name];
                        return newErrors;
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxChecked,
                    ]}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      case 'ATTACHMENT':
        const fileName = uploadedFiles[field.name]?.name || value;
        return (
          <View key={field.name} style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <TouchableOpacity
              style={[styles.fileButton, error && styles.inputError]}
              onPress={() => handlePickFile(field.name)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="paperclip" size={20} color="#4F6AF5" />
              <Text style={styles.fileButtonText}>
                {fileName || 'Selecionar arquivo'}
              </Text>
            </TouchableOpacity>
            {fileName && (
              <View style={styles.fileInfo}>
                <MaterialCommunityIcons name="file" size={16} color="#6b7280" />
                <Text style={styles.fileName}>{fileName}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setUploadedFiles((prev) => {
                      const newFiles = { ...prev };
                      delete newFiles[field.name];
                      return newFiles;
                    });
                    setFormData((prev) => ({ ...prev, [field.name]: '' }));
                  }}
                >
                  <MaterialCommunityIcons name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        );

      default:
        return null;
    }
  };

  if (!selectedFlow) return null;

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
            <View style={styles.headerInfo}>
              <Text style={styles.modalTitle}>Nova Atividade</Text>
              <Text style={styles.modalSubtitle}>{selectedFlow.name}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Título da Atividade (quando não há campo de título no formulário) */}
            {!hasTitleField && (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Título
                  <Text style={styles.requiredMark}> *</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, errors['taskName'] && styles.inputError]}
                  placeholder={'Digite o título da atividade'}
                  value={taskName}
                  onChangeText={(text) => {
                    setTaskName(text);
                    if (errors['taskName']) {
                      setErrors((prev) => {
                        const ne = { ...prev };
                        delete ne['taskName'];
                        return ne;
                      });
                    }
                  }}
                  placeholderTextColor="#9ca3af"
                />
                {errors['taskName'] && <Text style={styles.errorText}>{errors['taskName']}</Text>}
              </View>
            )}

            {selectedFlow.formInitial?.fields && selectedFlow.formInitial.fields.length > 0 ? (
              <>
                {selectedFlow.formInitial.fields.map((field) => renderField(field))}
              </>
            ) : (
              <View style={styles.emptyForm}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color="#d1d5db" />
                <Text style={styles.emptyFormText}>
                  Este fluxo não possui campos de formulário
                </Text>
              </View>
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
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
};

export default CreateTaskModal;
