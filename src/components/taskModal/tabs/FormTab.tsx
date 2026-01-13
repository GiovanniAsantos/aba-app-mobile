import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import type { TaskModalDetailsV2 } from '@/types/taskModal';
import type { TaskFormField } from '@/types/bpms';
import { FieldRenderer } from '../../fieldRenderer/FieldRenderer';

interface FormTabProps {
  taskDetails: TaskModalDetailsV2 | null;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  tokens?: { accessToken: string };
}

export const FormTab: React.FC<FormTabProps> = ({
  taskDetails,
  formData,
  setFormData,
  tokens,
}) => {
  const fields = taskDetails?.form?.stepsFields || [];

  if (fields.length === 0) {
    return (
      <View style={styles.emptyHistory}>
        <MaterialCommunityIcons name="file-document-outline" size={48} color="#d1d5db" />
        <Text style={styles.emptyHistoryText}>Nenhum campo de formulário</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {fields.map((field, index) => {
        const fieldId = field.stepFieldId;
        
        // Processar opções se for ONLY_CHOICE ou MULTIPLE_CHOICE
        let options: { label: string; value: string }[] | undefined;
        if ((field.type === 'ONLY_CHOICE' || field.type === 'MULTIPLE_CHOICE') && field.options) {
          try {
            const parsedOptions = typeof field.options === 'string' 
              ? JSON.parse(field.options) 
              : field.options;
            
            if (Array.isArray(parsedOptions)) {
              // Transformar para array de objetos {label, value}
              options = parsedOptions.map((opt: any) => {
                if (typeof opt === 'string') {
                  return { label: opt, value: opt };
                }
                return {
                  label: opt.label || opt.name || opt.value || String(opt),
                  value: opt.value || opt.name || opt.label || String(opt)
                };
              });
            }
          } catch (e) {
            console.error('Erro ao parsear opções do campo:', field.name, e);
          }
        }

        // Adaptar campo para o formato esperado pelo FieldRenderer
        const adaptedField: TaskFormField = {
          id: String(fieldId),
          stepFieldId: fieldId,
          name: field.name,
          label: field.name,
          type: field.type,
          required: field.notNull,
          notNull: field.notNull,
          value: formData[fieldId],
          response: field.response,
          helpText: field.helpText,
          description: field.description,
          options: options, // já é string[] | undefined
          placeholder: field.helpText || `Digite ${field.name.toLowerCase()}`,
        };

        return (
          <FieldRenderer
            key={`field-${fieldId}-${index}`}
            field={adaptedField}
            value={formData[fieldId]}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, [fieldId]: value }));
            }}
            tokens={tokens}
          />
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};
