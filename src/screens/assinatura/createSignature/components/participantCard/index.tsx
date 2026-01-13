import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Select } from '@/components';
import { styles } from './style';
import type { Participant } from '@/types/signature';

interface ParticipantCardProps {
  participant: Participant;
  groupIndex: number;
  participantIndex: number;
  onRemove: (groupIndex: number, participantIndex: number) => void;
  onUpdateType: (value: string, groupIndex: number, participantIndex: number) => void;
  onUpdateValidation: (value: string, groupIndex: number, participantIndex: number) => void;
  onUpdateValidationICP: (value: string, groupIndex: number, participantIndex: number) => void;
  onEditPosition: () => void; // Não precisa mais passar participante
  hasDocuments: boolean;
  onMoveUp?: (groupIndex: number, participantIndex: number) => void;
  onMoveDown?: (groupIndex: number, participantIndex: number) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

export function ParticipantCard({
  participant,
  groupIndex,
  participantIndex,
  onRemove,
  onUpdateType,
  onUpdateValidation,
  onUpdateValidationICP,
  onEditPosition,
  hasDocuments,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: ParticipantCardProps) {
  console.log("🚀 ~ ParticipantCard ~ participant:", participant)
  const [expanded, setExpanded] = useState(false);

  const participantTypeOptions = [
    { label: 'Signatário', value: 'SIGNATARIO' },
    { label: 'Aprovador', value: 'APPROVER' },
    { label: 'Observador', value: 'OBSERVER' },
    { label: 'Parte', value: 'PARTE' },
    { label: 'Interveniente', value: 'INTERVENIENTE' },
    { label: 'Testemunha', value: 'TESTEMUNHA' },
    { label: 'Endossante', value: 'ENDOSSANTE' },
    { label: 'Endossatário', value: 'ENDOSSATARIO' },
    { label: 'Administrador', value: 'ADMINISTRADOR' },
    { label: 'Emissor', value: 'EMISSOR' },
    { label: 'Procurador', value: 'PROCURADOR' },
    { label: 'Representante Legal', value: 'REPRESENTANTE_LEGAL' },
  ];

  const validationTypeOptions = [
    { label: 'Por Token (E-mail/SMS)', value: 'POR_TOKEN' },
    { label: 'Por Senha de Usuário', value: 'POR_SENHA' },
    { label: 'ICP-Brasil (Certificado Digital)', value: 'ICP_BRASIL' },
  ];

  const validationTypeForExternalParticipant = [
    { label: 'Por Token (E-mail/SMS)', value: 'POR_TOKEN' },
    { label: 'ICP-Brasil (Certificado Digital)', value: 'ICP_BRASIL' },
  ]

  const icpValidationOptions = [
    { label: 'CPF', value: 'CPF' },
    { label: 'CNPJ', value: 'CNPJ' },
  ];

  const handleRemove = () => {
    Alert.alert(
      'Remover Participante',
      `Deseja remover ${participant.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onRemove(groupIndex, participantIndex),
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const hasPositionDefined = participant.signaturePosition?.positionDefined;
  const hasPositionConfirmed = participant.signaturePosition?.docsAndPosition?.some(
    (pos) => pos.positionConfirmed
  );

  return (
    <View style={styles.participantCard}>
      <View style={styles.participantHeader}>
        {(onMoveUp || onMoveDown) && (
          <View style={{ marginRight: 8, gap: 4 }}>
            <TouchableOpacity
              onPress={() => onMoveUp?.(groupIndex, participantIndex)}
              disabled={!canMoveUp}
              style={{ opacity: canMoveUp ? 1 : 0.3 }}
            >
              <MaterialCommunityIcons name="chevron-up" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onMoveDown?.(groupIndex, participantIndex)}
              disabled={!canMoveDown}
              style={{ opacity: canMoveDown ? 1 : 0.3 }}
            >
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.participantAvatar}>
          <Text style={styles.participantAvatarText}>
            {getInitials(participant.name)}
          </Text>
        </View>
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{participant.name}</Text>
          <Text style={styles.participantEmail}>{participant.email}</Text>
          <Text style={styles.participantCpf}>{formatCPF(participant.cpf)}</Text>
        </View>
        <TouchableOpacity
          style={styles.participantRemoveButton}
          onPress={handleRemove}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
        }}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#666' }}>
          Configurações
        </Text>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.participantConfigSection}>
          {/* Tipo de Participante */}
          <View style={styles.participantConfigRow}>
            <Text style={styles.participantConfigLabel}>
              Tipo de Participante
            </Text>
            <Select
              value={participant.titleParticipant}
              onChange={(value) =>
                onUpdateType(String(value), groupIndex, participantIndex)
              }
              options={participantTypeOptions}
            />
          </View>

          {/* Tipo de Validação */}
          {participant.titleParticipant === 'SIGNATARIO' && (
            <>
              <View style={styles.participantConfigRow}>
                <Text style={styles.participantConfigLabel}>
                  Tipo de Validação
                </Text>
                <Select
                  value={participant.typeValidation}
                  onChange={(value) =>
                    onUpdateValidation(
                      String(value),
                      groupIndex,
                      participantIndex
                    )
                  }
                  options={participant.accountId ? validationTypeOptions : validationTypeForExternalParticipant}
                />
              </View>

              {/* Validação ICP */}
              {participant.typeValidation === 'ICP_BRASIL' && (
                <View style={styles.participantConfigRow}>
                  <Text style={styles.participantConfigLabel}>
                    Tipo de Validação ICP
                  </Text>
                  <Select
                    value={participant.typeValidateIcp || 'CPF'}
                    onChange={(value) =>
                      onUpdateValidationICP(
                        String(value),
                        groupIndex,
                        participantIndex
                      )
                    }
                    options={icpValidationOptions}
                  />
                </View>
              )}
            </>
          )}

          {/* Posição da Assinatura */}
          {participant.titleParticipant === 'SIGNATARIO' && hasDocuments && (
            <View style={styles.participantConfigRow}>
              <Text style={styles.participantConfigLabel}>
                Posição da Assinatura
              </Text>
              <TouchableOpacity
                style={styles.participantPositionButton}
                onPress={onEditPosition}
              >
                <MaterialCommunityIcons
                  name="draw"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.participantPositionButtonText}>
                  {hasPositionDefined
                    ? 'Editar Posição'
                    : 'Definir Posição'}
                </Text>
              </TouchableOpacity>

              {hasPositionDefined && (
                <View style={styles.participantPositionStatus}>
                  <MaterialCommunityIcons
                    name={hasPositionConfirmed ? 'check-circle' : 'alert-circle'}
                    size={16}
                    color={hasPositionConfirmed ? '#4caf50' : '#ff9800'}
                  />
                  <Text style={styles.participantPositionStatusText}>
                    {hasPositionConfirmed
                      ? 'Posição confirmada'
                      : 'Posição não confirmada'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
