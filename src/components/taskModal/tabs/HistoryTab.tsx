import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import type { TaskModalDetailsV2, TaskModalAction } from '@/types/taskModal';

// Função para formatar moeda
const formatCurrency = (value: string | number): string => {
  if (!value) return '';
  
  // Se for número, converter de centavos para reais
  let numValue: number;
  if (typeof value === 'string') {
    // Se já estiver formatado, retornar como está
    if (value.includes('R$') || value.includes(',')) {
      return value;
    }
    numValue = parseFloat(value);
  } else {
    numValue = value;
  }
  
  // Converter de centavos para reais
  const amount = numValue / 100;
  return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Função para formatar data
const formatDate = (value: string): string => {
  if (!value) return '';
  
  // Se contiver NaN, retornar valor original
  if (value.includes('NaN')) return value;
  
  // Se já estiver no formato DD/MM/YYYY válido, verificar e retornar
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})/;
  const match = value.match(dateRegex);
  if (match) {
    const [, day, month, year] = match;
    // Validar se os valores são válidos
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900) {
      return value;
    }
  }
  
  // Tentar parsear ISO date (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // Retornar original se inválido
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Se tiver horário significativo (não for meia-noite), incluir
    if (hours !== '00' || minutes !== '00') {
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    return `${day}/${month}/${year}`;
  } catch {
    return value; // Retornar original em caso de erro
  }
};

interface HistoryTabProps {
  taskDetails: TaskModalDetailsV2 | null;
  handleDownloadFile: (cloudUuid?: string, key?: string, fileName?: string) => Promise<void>;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  taskDetails,
  handleDownloadFile,
}) => {
  const actions = taskDetails?.actions || [];

  if (actions.length === 0) {
    return (
      <View style={styles.emptyHistory}>
        <MaterialCommunityIcons name="history" size={48} color="#d1d5db" />
        <Text style={styles.emptyHistoryText}>Nenhum histórico disponível</Text>
      </View>
    );
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'TASK_CREATED': 'Tarefa Criada',
      'TASK_ACCEPTED': 'Tarefa Confirmada',
      'TASK_RETURNED': 'Tarefa Devolvida',
      'TASK_CANCELLED': 'Tarefa Cancelada',
      'TASK_CLOSED': 'Tarefa Fechada',
      'INFO_INSERTED': 'Informação Inserida',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      'TASK_CREATED': 'plus-circle',
      'TASK_ACCEPTED': 'check-circle',
      'TASK_RETURNED': 'undo-variant',
      'TASK_CANCELLED': 'close-circle',
      'TASK_CLOSED': 'close-circle',
      'INFO_INSERTED': 'pencil-circle',
    };
    return icons[action] || 'circle';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'TASK_CREATED': '#10b981',
      'TASK_ACCEPTED': '#3b82f6',
      'TASK_RETURNED': '#f59e0b',
      'TASK_CANCELLED': '#ef4444',
      'TASK_CLOSED': '#ef4444',
      'INFO_INSERTED': '#8b5cf6',
    };
    return colors[action] || '#6b7280';
  };

  // Ordenar ações da mais recente para a mais antiga (últimas ações no topo)
  const sortedActions = [...actions].sort((a, b) => {
    // Converter DD/MM/YYYY HH:mm:ss para timestamp
    const parseDate = (dateStr: string) => {
      const [datePart, timePart] = dateStr.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 
                     parseInt(hours), parseInt(minutes), parseInt(seconds)).getTime();
    };
    
    return parseDate(b.createdAt) - parseDate(a.createdAt);
  });

  return (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {sortedActions.map((action, index) => (
        <View key={`action-${action.taskActionId || action.id}-${index}`} style={styles.historyItem}>
          {/* Header da ação */}
          <View style={styles.historyHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View 
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: action.stepOld?.color || getActionColor(action.action),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <MaterialCommunityIcons 
                  name={getActionIcon(action.action) as any} 
                  size={16} 
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyAction}>{getActionLabel(action.action)}</Text>
                {action.stepOld?.name && (
                  <View style={{
                    backgroundColor: action.stepOld.color + '20',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    alignSelf: 'flex-start',
                    marginTop: 4,
                  }}>
                    <Text style={{ fontSize: 11, color: action.stepOld.color, fontWeight: '600' }}>
                      {action.stepOld.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.historyDate}>
              {action.createdAt}
            </Text>
          </View>

          {/* Usuário que realizou a ação */}
          <Text style={styles.historyUser}>
            {action.createdBy || 'Desconhecido'}
          </Text>

          {/* Descrição/Motivo */}
          {action.description && (
            <View style={styles.historyDescriptionContainer}>
              <Text style={styles.historyDescriptionLabel}>
                {action.action === 'TASK_RETURNED' 
                  ? '📋 Motivo do Retorno:' 
                  : action.action === 'TASK_CLOSED' || action.action === 'TASK_CANCELLED'
                  ? '📋 Motivo do Cancelamento:'
                  : '📋 Descrição:'}
              </Text>
              <Text style={styles.historyDescriptionText}>
                {action.description}
              </Text>
            </View>
          )}

          {/* Transição de etapas */}
          {(action.stepOld || action.stepCurrent) && (
            <View style={styles.historyStagesContainer}>
              {action.stepOld && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.historyStagesLabel}>De: </Text>
                  <Text style={[styles.historyStages, { color: action.stepOld.color }]}>
                    {action.stepOld.name}
                  </Text>
                </View>
              )}
              {action.stepCurrent && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.historyStagesLabel}>Para: </Text>
                  <Text style={[styles.historyStages, { color: action.stepCurrent.color }]}>
                    {action.stepCurrent.name}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Campos preenchidos */}
          {action.stepOld?.fields && action.stepOld.fields.length > 0 && (
            <View style={styles.historyFieldsContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="form-textbox" size={14} color="#4F6AF5" />
                <Text style={styles.historyFieldsTitle}> Campos Preenchidos ({action.stepOld.fields.length})</Text>
              </View>
              {action.stepOld.fields.map((field, idx) => (
                <View key={`field-${field.id}-${idx}`} style={styles.historyFieldItem}>
                  <Text style={styles.historyFieldName}>• {field.name}</Text>
                  {field.type === 'ATTACHMENT' && field.atchs && field.atchs.length > 0 ? (
                    <View style={{ marginLeft: 12, marginTop: 4 }}>
                      {field.atchs.map((att, attIdx) => (
                        <TouchableOpacity 
                          key={`att-${attIdx}`} 
                          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}
                          onPress={() => handleDownloadFile(att.cloudUuid, att.key, att.name)}
                          activeOpacity={0.7}
                        >
                          <MaterialCommunityIcons name="paperclip" size={12} color="#4F6AF5" />
                          <Text style={[styles.historyFieldValue, { textDecorationLine: 'underline' }]}> {att.name}</Text>
                          {att.size && (
                            <Text style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>
                              ({(att.size / 1024).toFixed(1)} KB)
                            </Text>
                          )}
                          <MaterialCommunityIcons name="download" size={12} color="#4F6AF5" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : field.value ? (
                    <Text style={styles.historyFieldValue}>
                      {(() => {
                        const value = Array.isArray(field.value) ? field.value.join(', ') : String(field.value);
                        
                        // Aplicar formatação baseada no tipo
                        if (field.type === 'COIN') {
                          return formatCurrency(value);
                        } else if (field.type === 'DATE' || field.type === 'DATETIME' || field.type === 'DATE_TIME') {
                          return formatDate(value);
                        }
                        
                        return value;
                      })()}
                    </Text>
                  ) : (
                    <Text style={[styles.historyFieldValue, { color: '#9ca3af' }]}>-</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Arquivos de Assinatura */}
          {action.stepOld?.atchSignature && (
            <View style={styles.historySignatureContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="file-sign" size={14} color="#52c41a" />
                <Text style={styles.historyFieldsTitle}> Documentos de Assinatura</Text>
                {action.stepOld.atchSignature.signatureInvite?.statusSignature && (
                  <View style={{
                    backgroundColor: '#52c41a20',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginLeft: 8,
                  }}>
                    <Text style={{ fontSize: 10, color: '#52c41a', fontWeight: '600' }}>
                      {action.stepOld.atchSignature.signatureInvite.statusSignature}
                    </Text>
                  </View>
                )}
              </View>

              {/* Arquivos Originais */}
              {action.stepOld.atchSignature.files && action.stepOld.atchSignature.files.length > 0 && (
                <View style={styles.historySignatureSection}>
                  <Text style={styles.historySignatureSectionTitle}>📄 Arquivo Original</Text>
                  {action.stepOld.atchSignature.files.map((file, fileIdx) => (
                    <TouchableOpacity 
                      key={`file-${fileIdx}`} 
                      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
                      onPress={() => handleDownloadFile(file.cloudUuid, file.key, file.name)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="file-document" size={12} color="#4F6AF5" />
                      <Text style={[styles.historyFieldValue, { textDecorationLine: 'underline' }]}> {file.name}</Text>
                      {file.size && (
                        <Text style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </Text>
                      )}
                      <MaterialCommunityIcons name="download" size={12} color="#4F6AF5" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Arquivos Assinados */}
              {action.stepOld.atchSignature.signatureInvite?.signDocs && action.stepOld.atchSignature.signatureInvite.signDocs.length > 0 && (
                <View style={[styles.historySignatureSection, { borderLeftColor: '#52c41a' }]}>
                  <Text style={styles.historySignatureSectionTitle}>✅ Arquivo Assinado</Text>
                  {action.stepOld.atchSignature.signatureInvite.signDocs.map((doc, docIdx) => (
                    <TouchableOpacity 
                      key={`signed-${docIdx}`} 
                      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
                      onPress={() => handleDownloadFile(doc.cloudUuid, undefined, doc.name)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="file-check" size={12} color="#52c41a" />
                      <Text style={[styles.historyFieldValue, { color: '#52c41a', textDecorationLine: 'underline' }]}> {doc.name}</Text>
                      {doc.size && (
                        <Text style={{ fontSize: 10, color: '#9ca3af', marginLeft: 4 }}>
                          ({(doc.size / 1024).toFixed(1)} KB)
                        </Text>
                      )}
                      <MaterialCommunityIcons name="download" size={12} color="#52c41a" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};
