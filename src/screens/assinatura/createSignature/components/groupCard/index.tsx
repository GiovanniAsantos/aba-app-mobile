import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ParticipantCard } from '../participantCard';
import { styles } from './styles';
import type { SignatureGroup, Participant } from '@/types/signature';

interface GroupCardProps {
  group: SignatureGroup;
  groupIndex: number;
  onRemoveParticipant: (groupIndex: number, participantIndex: number) => void;
  onUpdateParticipantType: (value: string, groupIndex: number, participantIndex: number) => void;
  onUpdateValidation: (value: string, groupIndex: number, participantIndex: number) => void;
  onUpdateValidationICP: (value: string, groupIndex: number, participantIndex: number) => void;
  onEditPosition: (participant: Participant) => void;
  onMoveParticipantUp: (groupIndex: number, participantIndex: number) => void;
  onMoveParticipantDown: (groupIndex: number, participantIndex: number) => void;
  onRemoveGroup: (groupIndex: number) => void;
  onSelectRule: (groupIndex: number) => void;
  onAddParticipantToGroup?: (groupIndex: number) => void;
  hasDocuments: boolean;
  canMoveGroupUp: boolean;
  canMoveGroupDown: boolean;
  onMoveGroupUp: (groupIndex: number) => void;
  onMoveGroupDown: (groupIndex: number) => void;
}

export function GroupCard({
  group,
  groupIndex,
  onRemoveParticipant,
  onUpdateParticipantType,
  onUpdateValidation,
  onUpdateValidationICP,
  onEditPosition,
  onMoveParticipantUp,
  onMoveParticipantDown,
  onRemoveGroup,
  onSelectRule,
  onAddParticipantToGroup,
  hasDocuments,
  canMoveGroupUp,
  canMoveGroupDown,
  onMoveGroupUp,
  onMoveGroupDown,
}: GroupCardProps) {
  const getRuleLabel = () => {
    if (!group.ruleId) return 'Sem regra';
    switch (group.ruleId) {
      case 1: return 'Assinatura Simples';
      case 2: return 'Assinatura em Paralelo';
      case 3: return 'Assinatura em Sequência';
      default: return `Regra ${group.ruleId}`;
    }
  };

  return (
    <View style={styles.groupContainer}>
      {/* Group Header */}
      <View style={styles.groupHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ gap: 4 }}>
            <TouchableOpacity
              onPress={() => onMoveGroupUp(groupIndex)}
              disabled={!canMoveGroupUp}
              style={{ opacity: canMoveGroupUp ? 1 : 0.3 }}
            >
              <MaterialCommunityIcons name="chevron-up" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onMoveGroupDown(groupIndex)}
              disabled={!canMoveGroupDown}
              style={{ opacity: canMoveGroupDown ? 1 : 0.3 }}
            >
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.groupTitle}>Grupo {groupIndex + 1}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.groupRuleBadge}
            onPress={() => onSelectRule(groupIndex)}
          >
            <MaterialCommunityIcons name="cog" size={14} color="#fff" />
            <Text style={styles.groupRuleText}>{getRuleLabel()}</Text>
          </TouchableOpacity>
          
          {group.participants.length === 0 && (
            <TouchableOpacity onPress={() => onRemoveGroup(groupIndex)}>
              <MaterialCommunityIcons name="delete" size={20} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Participants */}
      {group.participants.length === 0 ? (
        <View style={styles.emptyGroup}>
          <MaterialCommunityIcons name="account-outline" size={32} color="#ccc" />
          <Text style={styles.emptyGroupText}>Grupo vazio</Text>
          {onAddParticipantToGroup && (
            <TouchableOpacity
              style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#4F6AF5', borderRadius: 8 }}
              onPress={() => onAddParticipantToGroup(groupIndex)}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Adicionar Participante</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
          {group.participants.map((participant, participantIndex) => (
            <ParticipantCard
              key={participant.idTemp}
              participant={participant}
              groupIndex={groupIndex}
              participantIndex={participantIndex}
              onRemove={onRemoveParticipant}
              onUpdateType={onUpdateParticipantType}
              onUpdateValidation={onUpdateValidation}
              onUpdateValidationICP={onUpdateValidationICP}
              onEditPosition={onEditPosition}
              hasDocuments={hasDocuments}
              onMoveUp={onMoveParticipantUp}
              onMoveDown={onMoveParticipantDown}
              canMoveUp={participantIndex > 0}
              canMoveDown={participantIndex < group.participants.length - 1}
            />
          ))}
          
          {/* Botão para adicionar mais participantes ao grupo */}
          {onAddParticipantToGroup && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginTop: 8, backgroundColor: '#f0f9ff', borderRadius: 8, borderWidth: 1, borderColor: '#4F6AF5', borderStyle: 'dashed' }}
              onPress={() => onAddParticipantToGroup(groupIndex)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#4F6AF5" />
              <Text style={{ color: '#4F6AF5', fontWeight: '600', fontSize: 14 }}>Adicionar Participante neste Grupo</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
