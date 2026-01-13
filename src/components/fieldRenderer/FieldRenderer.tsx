import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import type { TaskFormField } from '@/types/bpms';
import { styles } from './styles';
import { apiBpmsUrlV1 } from '@/config/api';

// Função para formatar CPF
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

// Função para formatar CNPJ
const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

// Lista de países e seus códigos
const COUNTRIES = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil', mask: '(00) 00000-0000', maxLength: 11 },
  { code: '+1', flag: '🇺🇸', name: 'EUA', mask: '(000) 000-0000', maxLength: 10 },
  { code: '+54', flag: '🇦🇷', name: 'Argentina', mask: '00 0000-0000', maxLength: 10 },
  { code: '+56', flag: '🇨🇱', name: 'Chile', mask: '0 0000 0000', maxLength: 9 },
  { code: '+57', flag: '🇨🇴', name: 'Colômbia', mask: '000 000 0000', maxLength: 10 },
  { code: '+351', flag: '🇵🇹', name: 'Portugal', mask: '00 000 0000', maxLength: 9 },
  { code: '+34', flag: '🇪🇸', name: 'Espanha', mask: '000 00 00 00', maxLength: 9 },
  { code: '+33', flag: '🇫🇷', name: 'França', mask: '0 00 00 00 00', maxLength: 9 },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido', mask: '00000 000000', maxLength: 10 },
  { code: '+49', flag: '🇩🇪', name: 'Alemanha', mask: '000 00000000', maxLength: 11 },
];

// Função para formatar telefone baseado no país
const formatTelephone = (value: string, countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  const numbers = value.replace(/\D/g, '');
  
  if (countryCode === '+55') {
    // Brasil
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  } else if (countryCode === '+1') {
    // EUA
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  }
  
  // Formato genérico para outros países
  return numbers;
};

// Função para formatar moeda
const formatCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (!numbers) return '';
  const amount = parseFloat(numbers) / 100;
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Componente Select para ONLY_CHOICE
const SelectField: React.FC<{
  field: TaskFormField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  tokens?: { accessToken: string };
}> = ({ field, value, onChange, disabled, tokens }) => {
  const [showModal, setShowModal] = useState(false);
  const [optionsList, setOptionsList] = useState(field.options || []);

  useEffect(() => {
    setOptionsList(field.options || []);
  }, [field.options]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        let stepFieldOptions: Array<{choiceValueId: number, stepFieldId: number, initialFieldId: number | null, value: string}> = [];
        if (field.stepFieldId) {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (tokens?.accessToken) {
            headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          }
          
          const responseStep = await fetch(`${apiBpmsUrlV1}/choice-values/step-field/${field.stepFieldId}`, {
            headers,
          });
          if (responseStep.ok) {
            stepFieldOptions = await responseStep.json();
          }
        }

        let initialFieldOptions: Array<{choiceValueId: number, stepFieldId: number | null, initialFieldId: number, value: string}> = [];
        if (field.initialFieldId) {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (tokens?.accessToken) {
            headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          }
          
          const responseInitial = await fetch(`${apiBpmsUrlV1}/choice-values/initial-field/${field.initialFieldId}`, {
            headers,
          });
          if (responseInitial.ok) {
            initialFieldOptions = await responseInitial.json();
          }
        }

        const allOptions = [...stepFieldOptions, ...initialFieldOptions];
        const uniqueOptions = allOptions.filter((option, index, self) =>
          index === self.findIndex(o => o.value === option.value)
        );
        
        // Converter para o formato esperado {label, value}
        const formattedOptions = uniqueOptions.map(opt => ({
          label: opt.value,
          value: opt.value
        }));
        
        setOptionsList(formattedOptions);
      } catch (error) {
        console.error("Erro ao buscar opções:", error);
      }
    };

    if (field.stepFieldId || field.initialFieldId) {
      fetchOptions();
    }
  }, [field.stepFieldId, field.initialFieldId]);

  const selectedOption = optionsList.find(opt => opt.value === value);

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.inputDisabled]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !selectedOption && styles.selectPlaceholder]}>
          {selectedOption?.label || field.placeholder || 'Selecione uma opção'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{field.label}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {optionsList.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    value === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setShowModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalOptionText,
                    value === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <MaterialCommunityIcons name="check" size={20} color="#4F6AF5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Componente MultiSelect para MULTIPLE_CHOICE
const MultiSelectField: React.FC<{
  field: TaskFormField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  tokens?: { accessToken: string };
}> = ({ field, value, onChange, disabled, tokens }) => {
  const [showModal, setShowModal] = useState(false);
  const [optionsList, setOptionsList] = useState(field.options || []);

  useEffect(() => {
    setOptionsList(field.options || []);
  }, [field.options]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        let stepFieldOptions: Array<{choiceValueId: number, stepFieldId: number, initialFieldId: number | null, value: string}> = [];
        if (field.stepFieldId) {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (tokens?.accessToken) {
            headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          }
          
          const responseStep = await fetch(`${apiBpmsUrlV1}/choice-values/step-field/${field.stepFieldId}`, {
            headers,
          });
          if (responseStep.ok) {
            stepFieldOptions = await responseStep.json();
          }
        }

        let initialFieldOptions: Array<{choiceValueId: number, stepFieldId: number | null, initialFieldId: number, value: string}> = [];
        if (field.initialFieldId) {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (tokens?.accessToken) {
            headers['Authorization'] = `Bearer ${tokens.accessToken}`;
          }
          
          const responseInitial = await fetch(`${apiBpmsUrlV1}/choice-values/initial-field/${field.initialFieldId}`, {
            headers,
          });
          if (responseInitial.ok) {
            initialFieldOptions = await responseInitial.json();
          }
        }

        const allOptions = [...stepFieldOptions, ...initialFieldOptions];
        const uniqueOptions = allOptions.filter((option, index, self) =>
          index === self.findIndex(o => o.value === option.value)
        );
        
        // Converter para o formato esperado {label, value}
        const formattedOptions = uniqueOptions.map(opt => ({
          label: opt.value,
          value: opt.value
        }));
        
        setOptionsList(formattedOptions);
      } catch (error) {
        console.error("Erro ao buscar opções:", error);
      }
    };

    if (field.stepFieldId || field.initialFieldId) {
      fetchOptions();
    }
  }, [field.stepFieldId, field.initialFieldId]);

  // Converter value para array de valores
  const selectedValues = Array.isArray(value)
    ? value
    : (typeof value === 'string' && value)
      ? value.split(',').map(v => v.trim())
      : [];

  const selectedLabels = optionsList
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label)
    .join(', ');

  const toggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      const newValues = selectedValues.filter(v => v !== optionValue);
      onChange(newValues.join(','));
    } else {
      const newValues = [...selectedValues, optionValue];
      onChange(newValues.join(','));
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.inputDisabled]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectText, !selectedLabels && styles.selectPlaceholder]} numberOfLines={2}>
          {selectedLabels || field.placeholder || 'Selecione uma ou mais opções'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{field.label}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="check-circle" size={24} color="#4F6AF5" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {optionsList.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.modalOption}
                    onPress={() => toggleOption(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Componente TelephoneField com seleção de país
const TelephoneField: React.FC<{
  field: TaskFormField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}> = ({ field, value, onChange, disabled }) => {
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Brasil por padrão
  
  // Extrair código do país e número do value
  useEffect(() => {
    if (value && typeof value === 'string' && value.includes('|')) {
      const [code, number] = value.split('|');
      const country = COUNTRIES.find(c => c.code === code);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, []);

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
    // Manter apenas o número ao trocar de país
    if (value && typeof value === 'string' && value.includes('|')) {
      const [, number] = value.split('|');
      onChange(`${country.code}|${number}`);
    }
  };

  const handlePhoneChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    const limited = numbers.slice(0, selectedCountry.maxLength);
    onChange(`${selectedCountry.code}|${limited}`);
  };

  const getDisplayValue = () => {
    if (!value) return '';
    const phoneNumber = typeof value === 'string' && value.includes('|') 
      ? value.split('|')[1] 
      : value.replace(/\D/g, '');
    return formatTelephone(phoneNumber, selectedCountry.code);
  };

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          style={[styles.countryButton, disabled && styles.inputDisabled]}
          onPress={() => !disabled && setShowCountryModal(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCode}>{selectedCountry.code}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { flex: 1 }, disabled && styles.inputDisabled]}
          value={getDisplayValue()}
          onChangeText={handlePhoneChange}
          placeholder={selectedCountry.mask}
          editable={!disabled}
          keyboardType="phone-pad"
        />
      </View>

      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o país</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.modalOption,
                    selectedCountry.code === country.code && styles.modalOptionSelected
                  ]}
                  onPress={() => handleCountrySelect(country)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalOptionText}>{country.name}</Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>{country.code}</Text>
                  </View>
                  {selectedCountry.code === country.code && (
                    <MaterialCommunityIcons name="check" size={20} color="#4F6AF5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Componente DatePicker para DATE/DATETIME
const DateField: React.FC<{
  field: TaskFormField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}> = ({ field, value, onChange, disabled }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date>(() => {
    if (value && typeof value === 'string') {
      // Tentar parsear DD/MM/YYYY ou DD/MM/YYYY HH:mm:ss
      const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    return new Date();
  });

  const formatDisplayDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (field.type === 'DATE') {
      return `${day}/${month}/${year}`;
    } else {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      onChange(formatDisplayDate(selectedDate));
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.inputDisabled]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="calendar" size={20} color="#4F6AF5" />
        <Text style={[styles.selectText, { marginLeft: 8 }]}>
          {value || field.placeholder || (field.type === 'DATE' ? 'dd/mm/aaaa' : 'dd/mm/aaaa HH:mm')}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode={field.type === 'DATE' ? 'date' : 'datetime'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.iosPickerButton}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              onChange(formatDisplayDate(date));
              setShowPicker(false);
            }}>
              <Text style={[styles.iosPickerButton, { color: '#4F6AF5', fontWeight: '600' }]}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

interface FieldRendererProps {
  field: TaskFormField;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  tokens?: { accessToken: string };
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, disabled = false, tokens }) => {
  const renderField = () => {
    switch (field.type) {
      case 'TEXT':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value || ''}
            onChangeText={onChange}
            placeholder={field.placeholder || `Digite ${field.label}`}
            editable={!disabled}
            autoCapitalize="sentences"
          />
        );

      case 'EMAIL':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value || ''}
            onChangeText={(text) => {
              // Remover espaços e converter para minúsculas
              const cleaned = text.trim().toLowerCase();
              onChange(cleaned);
            }}
            placeholder={field.placeholder || `Digite ${field.label}`}
            editable={!disabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        );

      case 'LINK':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value || ''}
            onChangeText={(text) => {
              // Remover espaços
              const cleaned = text.trim();
              onChange(cleaned);
            }}
            placeholder={field.placeholder || 'https://...'}
            editable={!disabled}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        );

      case 'CPF':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value ? formatCPF(value) : ''}
            onChangeText={(text) => {
              const numbers = text.replace(/\D/g, '');
              onChange(numbers.slice(0, 11));
            }}
            placeholder={field.placeholder || '000.000.000-00'}
            editable={!disabled}
            keyboardType="numeric"
            maxLength={14}
          />
        );

      case 'CNPJ':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value ? formatCNPJ(value) : ''}
            onChangeText={(text) => {
              const numbers = text.replace(/\D/g, '');
              onChange(numbers.slice(0, 14));
            }}
            placeholder={field.placeholder || '00.000.000/0000-00'}
            editable={!disabled}
            keyboardType="numeric"
            maxLength={18}
          />
        );

      case 'TELEPHONE':
        return <TelephoneField field={field} value={value} onChange={onChange} disabled={disabled} />;

      case 'TEXT_AREA':
        return (
          <TextInput
            style={[styles.input, styles.textArea, disabled && styles.inputDisabled]}
            value={value || ''}
            onChangeText={onChange}
            placeholder={field.placeholder || `Digite ${field.label}`}
            editable={!disabled}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        );

      case 'NUMBER':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value?.toString() || ''}
            onChangeText={(text) => {
              // Filtrar IMEDIATAMENTE qualquer coisa que não seja número ou sinal de menos
              const filtered = text.split('').filter(char => /[0-9-]/.test(char)).join('');
              
              // Garantir apenas um sinal de menos e apenas no início
              if (filtered.includes('-')) {
                const firstChar = filtered.charAt(0);
                const rest = filtered.slice(1).replace(/-/g, '');
                onChange((firstChar === '-' ? '-' : '') + rest);
              } else {
                onChange(filtered);
              }
            }}
            placeholder={field.placeholder || `Digite ${field.label}`}
            editable={!disabled}
            keyboardType="number-pad"
          />
        );

      case 'COIN':
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value ? formatCurrency(value.toString()) : ''}
            onChangeText={(text) => {
              // Filtrar caractere por caractere - apenas dígitos
              const filtered = text.split('').filter(char => /[0-9]/.test(char)).join('');
              // Limitar a valores razoáveis (até 999999999999 = 9.999.999.999,99)
              const limited = filtered.slice(0, 12);
              onChange(limited);
            }}
            placeholder={field.placeholder || '0,00'}
            editable={!disabled}
            keyboardType="number-pad"
          />
        );

      case 'DATE':
      case 'DATETIME':
      case 'DATE_TIME':
        return <DateField field={field} value={value} onChange={onChange} disabled={disabled} />;

      case 'ONLY_CHOICE':
        return <SelectField field={field} value={value} onChange={onChange} disabled={disabled} tokens={tokens} />;

      case 'MULTIPLE_CHOICE':
        return <MultiSelectField field={field} value={value} onChange={onChange} disabled={disabled} tokens={tokens} />;

      case 'ATTACHMENT':
        return (
          <View>
            <TouchableOpacity
              style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
              onPress={async () => {
                if (disabled) return;
                try {
                  const result = await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    copyToCacheDirectory: true,
                  });

                  if (!result.canceled && result.assets && result.assets.length > 0) {
                    onChange(result.assets[0]);
                  }
                } catch (error) {
                  console.error('Erro ao selecionar arquivo:', error);
                }
              }}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="paperclip" size={20} color={disabled ? '#999' : '#4F6AF5'} />
              <Text style={[styles.uploadText, disabled && styles.uploadTextDisabled]}>
                {value ? 'Alterar arquivo' : 'Selecionar arquivo'}
              </Text>
            </TouchableOpacity>
            {value && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <MaterialCommunityIcons name="file-document" size={16} color="#4F6AF5" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {typeof value === 'object' && value.name ? value.name :
                    typeof value === 'string' ? value : 'Arquivo anexado'}
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return (
          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value || ''}
            onChangeText={onChange}
            placeholder={field.placeholder || `Digite ${field.label}`}
            editable={!disabled}
          />
        );
    }
  };

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        {field.required && <Text style={styles.requiredMark}> *</Text>}
      </View>
      {renderField()}
      {field.description && (
        <Text style={styles.fieldDescription}>{field.description}</Text>
      )}
    </View>
  );
};

