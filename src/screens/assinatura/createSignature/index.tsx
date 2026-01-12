import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Input } from '@/components';
import { useAuth } from '@/context/AuthProvider';
import { apiSignatureUrlV1 } from '@/config/api';
import { styles } from './style';
import {
  DocumentList,
  AddParticipantModal,
  ParticipantCard,
  GroupCard,
  SignaturePositionEditor,
  RuleSelectModal,
} from './components';
import { SelectFileFromCloud } from '@/components/selectFileFromCloud/SelectFileFromCloud';
import type {
  SignatureGroup,
  SignatureDocument,
  Participant,
  SearchedUser,
  SignaturePosition,
} from '@/types/signature';
import { v4 as uuidv4 } from 'uuid';

const CreateSignature = () => {
  const { tokens } = useAuth();
  const [title, setTitle] = useState('');
  const [documents, setDocuments] = useState<SignatureDocument[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groupsSignature, setGroupsSignature] = useState<SignatureGroup[]>([]);
  const [orderingEnabled, setOrderingEnabled] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showPositionEditor, setShowPositionEditor] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetGroupForNewParticipant, setTargetGroupForNewParticipant] = useState<number | null>(null);
  const [showSelectFileModal, setShowSelectFileModal] = useState(false);

  // Quando ativa ordenação, converte cada participante em um grupo
  const handleEnableOrdering = () => {
    if (participants.length < 2) {
      Alert.alert('Aviso', 'Adicione pelo menos 2 participantes para definir ordem');
      return;
    }

    const groups: SignatureGroup[] = participants.map((participant) => ({
      participants: [participant],
      ruleId: null,
    }));

    setGroupsSignature(groups);
    setOrderingEnabled(true);
    setParticipants([]); // Limpa lista simples
  };

  // Desativa ordenação e volta para lista simples
  const handleDisableOrdering = () => {
    const allParticipants = groupsSignature.flatMap((g) => g.participants);
    setParticipants(allParticipants);
    setGroupsSignature([]);
    setOrderingEnabled(false);
  };

  const createNewGroup = () => {
    const newGroup: SignatureGroup = {
      participants: [],
      ruleId: null,
    };
    setGroupsSignature([...groupsSignature, newGroup]);
  };

  const removeGroup = (groupIndex: number) => {
    const updatedGroups = groupsSignature.filter((_, index) => index !== groupIndex);
    setGroupsSignature(updatedGroups);
  };

  const selectGroupRule = (groupIndex: number) => {
    setSelectedGroupIndex(groupIndex);
    setShowRuleModal(true);
  };

  const handleRuleSelect = (ruleId: number | null) => {
    if (selectedGroupIndex !== null) {
      const updatedGroups = [...groupsSignature];
      updatedGroups[selectedGroupIndex].ruleId = ruleId;
      setGroupsSignature(updatedGroups);
    }
  };

  const moveGroupUp = (groupIndex: number) => {
    if (groupIndex === 0) return;
    const updatedGroups = [...groupsSignature];
    const temp = updatedGroups[groupIndex];
    updatedGroups[groupIndex] = updatedGroups[groupIndex - 1];
    updatedGroups[groupIndex - 1] = temp;
    setGroupsSignature(updatedGroups);
  };

  const moveGroupDown = (groupIndex: number) => {
    if (groupIndex === groupsSignature.length - 1) return;
    const updatedGroups = [...groupsSignature];
    const temp = updatedGroups[groupIndex];
    updatedGroups[groupIndex] = updatedGroups[groupIndex + 1];
    updatedGroups[groupIndex + 1] = temp;
    setGroupsSignature(updatedGroups);
  };

  const moveParticipantUp = (groupIndex: number, participantIndex: number) => {
    if (participantIndex === 0) return;
    const updatedGroups = [...groupsSignature];
    const participants = [...updatedGroups[groupIndex].participants];
    const temp = participants[participantIndex];
    participants[participantIndex] = participants[participantIndex - 1];
    participants[participantIndex - 1] = temp;
    updatedGroups[groupIndex].participants = participants;
    setGroupsSignature(updatedGroups);
  };

  const moveParticipantDown = (groupIndex: number, participantIndex: number) => {
    const group = groupsSignature[groupIndex];
    if (participantIndex === group.participants.length - 1) return;
    const updatedGroups = [...groupsSignature];
    const participants = [...updatedGroups[groupIndex].participants];
    const temp = participants[participantIndex];
    participants[participantIndex] = participants[participantIndex + 1];
    participants[participantIndex + 1] = temp;
    updatedGroups[groupIndex].participants = participants;
    setGroupsSignature(updatedGroups);
  };

  const searchUsers = async (text: string): Promise<SearchedUser[]> => {
    try {
      const response = await fetch(
        `${apiSignatureUrlV1}/accounts/search?name=${text}`,
        {
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );
      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  };

  const handleAddInternalParticipant = (user: SearchedUser) => {
    const allParticipants = orderingEnabled
      ? groupsSignature.flatMap((g) => g.participants)
      : participants;

    const userAlreadyExists = allParticipants.some(
      (p) => p.accountId === user.id || p.cpf === user.numberDocument
    );

    if (userAlreadyExists) {
      Alert.alert('Aviso', 'Este usuário já foi adicionado');
      return;
    }

    const newParticipant: Participant = {
      idTemp: uuidv4(),
      accountId: user.id,
      cpf: user.numberDocument,
      email: user.email || user.contact || '',
      name: user.name.split(' - ')[0],
      urlPhotoPerfil: user.urlPhotoPerfil,
      titleParticipant: 'SIGNATARIO',
      typeValidation: 'POR_TOKEN',
      typeValidateIcp: 'CPF',
      signaturePosition: {
        positionDefined: false,
        docsAndPosition: [],
      },
      rubricPosition: {
        rubricOption: 'NOT_SIGN',
        docsAndPosition: [],
        allPages: true,
        positionDefined: false,
      },
      representant: {
        cnpj: '',
        razaoSocial: '',
      },
    };

    if (orderingEnabled) {
      // Se tem grupo alvo específico, adiciona nele
      if (targetGroupForNewParticipant !== null && groupsSignature[targetGroupForNewParticipant]) {
        const updatedGroups = [...groupsSignature];
        updatedGroups[targetGroupForNewParticipant].participants.push(newParticipant);
        setGroupsSignature(updatedGroups);
      } else {
        // Senão, adiciona ao último grupo existente
        if (groupsSignature.length === 0) {
          const newGroup: SignatureGroup = {
            participants: [newParticipant],
            ruleId: null,
          };
          setGroupsSignature([newGroup]);
        } else {
          const updatedGroups = [...groupsSignature];
          updatedGroups[updatedGroups.length - 1].participants.push(newParticipant);
          setGroupsSignature(updatedGroups);
        }
      }
    } else {
      // Adiciona à lista simples
      setParticipants([...participants, newParticipant]);
    }
    
    // Limpa o grupo alvo
    setTargetGroupForNewParticipant(null);
  };

  const handleAddExternalParticipant = (data: {
    nome: string;
    cpf: string;
    email: string;
  }) => {
    const allParticipants = orderingEnabled
      ? groupsSignature.flatMap((g) => g.participants)
      : participants;

    const userAlreadyExists = allParticipants.some(
      (p) => p.cpf === data.cpf.replace(/\D/g, '')
    );

    if (userAlreadyExists) {
      Alert.alert('Aviso', 'Este participante já foi adicionado');
      return;
    }

    const newParticipant: Participant = {
      idTemp: uuidv4(),
      cpf: data.cpf.replace(/\D/g, ''),
      email: data.email,
      name: data.nome,
      titleParticipant: 'SIGNATARIO',
      typeValidation: 'POR_TOKEN',
      typeValidateIcp: 'CPF',
      signaturePosition: {
        positionDefined: false,
        docsAndPosition: [],
      },
      rubricPosition: {
        rubricOption: 'NOT_SIGN',
        docsAndPosition: [],
        allPages: true,
        positionDefined: false,
      },
      representant: {
        cnpj: '',
        razaoSocial: '',
      },
    };

    if (orderingEnabled) {
      // Se tem grupo alvo específico, adiciona nele
      if (targetGroupForNewParticipant !== null && groupsSignature[targetGroupForNewParticipant]) {
        const updatedGroups = [...groupsSignature];
        updatedGroups[targetGroupForNewParticipant].participants.push(newParticipant);
        setGroupsSignature(updatedGroups);
      } else {
        // Senão, adiciona ao último grupo existente
        if (groupsSignature.length === 0) {
          const newGroup: SignatureGroup = {
            participants: [newParticipant],
            ruleId: null,
          };
          setGroupsSignature([newGroup]);
        } else {
          const updatedGroups = [...groupsSignature];
          updatedGroups[updatedGroups.length - 1].participants.push(newParticipant);
          setGroupsSignature(updatedGroups);
        }
      }
    } else {
      // Adiciona à lista simples
      setParticipants([...participants, newParticipant]);
    }
    
    // Limpa o grupo alvo
    setTargetGroupForNewParticipant(null);
  };

  // Remove participante da lista simples
  const handleRemoveSimpleParticipant = (participantIndex: number) => {
    const updatedParticipants = participants.filter((_, index) => index !== participantIndex);
    setParticipants(updatedParticipants);
  };

  // Remove participante de um grupo
  const handleRemoveParticipant = (groupIndex: number, participantIndex: number) => {
    const updatedGroups = [...groupsSignature];
    updatedGroups[groupIndex].participants.splice(participantIndex, 1);

    // Remove grupo vazio se não for o único
    if (updatedGroups[groupIndex].participants.length === 0 && updatedGroups.length > 1) {
      updatedGroups.splice(groupIndex, 1);
    }

    setGroupsSignature(updatedGroups);
  };

  const handleUpdateParticipantType = (
    value: string,
    groupIndex: number,
    participantIndex: number
  ) => {
    if (orderingEnabled) {
      const updatedGroups = [...groupsSignature];
      updatedGroups[groupIndex].participants[participantIndex].titleParticipant =
        value as any;
      setGroupsSignature(updatedGroups);
    } else {
      const updatedParticipants = [...participants];
      updatedParticipants[participantIndex].titleParticipant = value as any;
      setParticipants(updatedParticipants);
    }
  };

  const handleUpdateValidation = (
    value: string,
    groupIndex: number,
    participantIndex: number
  ) => {
    if (orderingEnabled) {
      const updatedGroups = [...groupsSignature];
      updatedGroups[groupIndex].participants[participantIndex].typeValidation =
        value as any;
      setGroupsSignature(updatedGroups);
    } else {
      const updatedParticipants = [...participants];
      updatedParticipants[participantIndex].typeValidation = value as any;
      setParticipants(updatedParticipants);
    }
  };

  const handleUpdateValidationICP = (
    value: string,
    groupIndex: number,
    participantIndex: number
  ) => {
    if (orderingEnabled) {
      const updatedGroups = [...groupsSignature];
      updatedGroups[groupIndex].participants[participantIndex].typeValidateIcp =
        value as any;
      setGroupsSignature(updatedGroups);
    } else {
      const updatedParticipants = [...participants];
      updatedParticipants[participantIndex].typeValidateIcp = value as any;
      setParticipants(updatedParticipants);
    }
  };

  const handleEditPosition = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowPositionEditor(true);
  };

  const handleSavePosition = (
    updatedParticipant: Participant,
    positions: SignaturePosition[]
  ) => {
    if (orderingEnabled) {
      const updatedGroups = groupsSignature.map((group) => ({
        ...group,
        participants: group.participants.map((p) =>
          p.idTemp === updatedParticipant.idTemp ? updatedParticipant : p
        ),
      }));
      setGroupsSignature(updatedGroups);
    } else {
      const updatedParticipants = participants.map((p) =>
        p.idTemp === updatedParticipant.idTemp ? updatedParticipant : p
      );
      setParticipants(updatedParticipants);
    }
  };

  const handleAddDocument = async () => {
    setShowSelectFileModal(true);
  };

  const handleSelectFilesFromCloud = (cloudFiles: any[]) => {
    const newDocuments: SignatureDocument[] = cloudFiles.map((file) => ({
      key: file.fileProps.key,
      name: file.name,
      fileProps: {
        key: file.fileProps.key,
        bucket: 'cloud',
        uri: file.fileProps.path || '',
        size: file.fileProps.size,
        mimeType: file.fileProps.type,
      },
    }));

    setDocuments([...documents, ...newDocuments]);
    Alert.alert(
      'Sucesso',
      `${newDocuments.length} arquivo${newDocuments.length > 1 ? 's' : ''} adicionado${newDocuments.length > 1 ? 's' : ''}`
    );
  };

  const handleRemoveDocument = (docKey: string) => {
    setDocuments(documents.filter((doc) => doc.fileProps?.key !== docKey));
  };

  const handleViewDocument = async (doc: SignatureDocument) => {
    if (doc.fileProps?.uri) {
      try {
        const canOpen = await Linking.canOpenURL(doc.fileProps.uri);
        if (canOpen) {
          await Linking.openURL(doc.fileProps.uri);
        } else {
          Alert.alert('Documento', `${doc.name}\n\nTamanho: ${doc.fileProps.size ? (doc.fileProps.size / 1024).toFixed(2) + ' KB' : 'Desconhecido'}`);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível abrir o documento');
      }
    } else {
      Alert.alert('Documento', doc.name);
    }
  };

  const validateForm = (): boolean => {
    if (!title || title.length < 5) {
      Alert.alert('Erro', 'Título deve ter no mínimo 5 caracteres');
      return false;
    }

    if (documents.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um documento');
      return false;
    }

    const allParticipants = orderingEnabled
      ? groupsSignature.flatMap((g) => g.participants)
      : participants;

    if (allParticipants.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um participante');
      return false;
    }

    const hasSignatory = allParticipants.some((p) => p.titleParticipant === 'SIGNATARIO');

    if (!hasSignatory) {
      Alert.alert('Erro', 'Adicione pelo menos um signatário');
      return false;
    }

    return true;
  };

  const handleCreateSignature = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const allParticipants = orderingEnabled
        ? groupsSignature.flatMap((g) => g.participants)
        : participants;

      const request = {
        title,
        description: title,
        ref: '',
        module: 'CLOUD',
        documents: documents.map((doc) => ({
          cloudFileUuid: doc.fileProps?.key || doc.key || '',
        })),
        groups: orderingEnabled
          ? groupsSignature.map((group, index) => ({
              sequence: index + 1,
              ruleId: group.ruleId,
              participants: group.participants.map((part) => ({
                accountId: part.accountId,
                cpf: part.cpf,
                email: part.email,
                name: part.name,
                titleParticipant: part.titleParticipant,
                typeValidation:
                  part.titleParticipant === 'SIGNATARIO'
                    ? part.typeValidation
                    : undefined,
                typeValidateIcp:
                  part.titleParticipant === 'SIGNATARIO'
                    ? part.typeValidateIcp
                    : undefined,
                representant: null,
                marcationRubric: part.rubricPosition.rubricOption,
                marcationSign: part.signaturePosition.positionDefined
                  ? 'REQUIRED_SIGN'
                  : 'OPTIONAL_SIGN',
                marcationSigns: part.signaturePosition.positionDefined
                  ? part.signaturePosition.docsAndPosition
                      .filter((pos) => pos.positionConfirmed)
                      .map((pos) => ({
                        docToSignUuid: pos.docKey,
                        height: pos.height,
                        width: pos.width,
                        numberPage: pos.docPage || 1,
                        positionX: pos.x,
                        positionY: pos.docHeight - pos.y - pos.height,
                        signType: 'DESIGN',
                      }))
                  : [],
                marcationRubrics: [],
              })),
            }))
          : [
              {
                sequence: 1,
                ruleId: null,
                participants: allParticipants.map((part) => ({
                  accountId: part.accountId,
                  cpf: part.cpf,
                  email: part.email,
                  name: part.name,
                  titleParticipant: part.titleParticipant,
                  typeValidation:
                    part.titleParticipant === 'SIGNATARIO'
                      ? part.typeValidation
                      : undefined,
                  typeValidateIcp:
                    part.titleParticipant === 'SIGNATARIO'
                      ? part.typeValidateIcp
                      : undefined,
                  representant: null,
                  marcationRubric: part.rubricPosition.rubricOption,
                  marcationSign: part.signaturePosition.positionDefined
                    ? 'REQUIRED_SIGN'
                    : 'OPTIONAL_SIGN',
                  marcationSigns: part.signaturePosition.positionDefined
                    ? part.signaturePosition.docsAndPosition
                        .filter((pos) => pos.positionConfirmed)
                        .map((pos) => ({
                          docToSignUuid: pos.docKey,
                          height: pos.height,
                          width: pos.width,
                          numberPage: pos.docPage || 1,
                          positionX: pos.x,
                          positionY: pos.docHeight - pos.y - pos.height,
                          signType: 'DESIGN',
                        }))
                    : [],
                  marcationRubrics: [],
                })),
              },
            ],
        orderParticipants: orderingEnabled,
        typeRegistration: 'ENVIAR',
      };

      const response = await fetch(`${apiSignatureUrlV1}/signatures/me/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar assinatura');
      }

      Alert.alert('Sucesso', 'Assinatura criada com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setDocuments([]);
            setParticipants([]);
            setGroupsSignature([]);
            setOrderingEnabled(false);
          },
        },
      ]);
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      Alert.alert('Erro', 'Não foi possível criar a assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.tabContent}>
      {/* Título */}
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>1. Título da Assinatura</Text>
        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Digite o título da assinatura..."
        />
      </View>

      {/* Documentos */}
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>2. Documentos</Text>
        <DocumentList
          documents={documents}
          onAddDocument={handleAddDocument}
          onRemoveDocument={handleRemoveDocument}
          onViewDocument={handleViewDocument}
        />
      </View>

      {/* Participantes */}
      <View style={styles.createSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={styles.sectionTitle}>3. Participantes</Text>
          <Button
            title="Adicionar Participante"
            onPress={() => setShowAddParticipantModal(true)}
            variant="primary"
          />
        </View>

        {!orderingEnabled && participants.length === 0 && groupsSignature.length === 0 && (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <MaterialCommunityIcons name="account-group" size={48} color="#ccc" />
            <Text style={{ marginTop: 16, color: '#999', textAlign: 'center' }}>
              Nenhum participante adicionado
            </Text>
            <Text style={{ marginTop: 8, color: '#999', textAlign: 'center', fontSize: 12 }}>
              Adicione participantes para começar
            </Text>
          </View>
        )}

        {/* Lista Simples de Participantes */}
        {!orderingEnabled && participants.length > 0 && (
          <View>
            {/* Botão Definir Ordem */}
            {participants.length >= 2 && (
              <View style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, color: '#0066cc', marginBottom: 8 }}>
                  Você tem {participants.length} participantes. Deseja definir ordem de assinatura?
                </Text>
                <Button
                  title="Definir Ordem"
                  onPress={handleEnableOrdering}
                  variant="secondary"
                />
              </View>
            )}

            {/* Lista de Participantes sem ordem */}
            {participants.map((participant, index) => (
              <ParticipantCard
                key={participant.idTemp}
                participant={participant}
                groupIndex={0}
                participantIndex={index}
                onRemove={(_grp: number, idx: number) => handleRemoveSimpleParticipant(idx)}
                onUpdateType={(value: string, _grp: number, idx: number) => handleUpdateParticipantType(value, 0, idx)}
                onUpdateValidation={(value: string, _grp: number, idx: number) => handleUpdateValidation(value, 0, idx)}
                onUpdateValidationICP={(value: string, _grp: number, idx: number) => handleUpdateValidationICP(value, 0, idx)}
                onEditPosition={handleEditPosition}
                hasDocuments={documents.length > 0}
                onMoveUp={() => {}}
                onMoveDown={() => {}}
                canMoveUp={false}
                canMoveDown={false}
              />
            ))}
          </View>
        )}

        {/* Grupos com Ordem */}
        {orderingEnabled && groupsSignature.length > 0 && (
          <View>
            {/* Botão Desabilitar Ordem */}
            <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  Ordem definida. Grupos em sequência de assinatura.
                </Text>
                <Button
                  title="Desabilitar Ordem"
                  onPress={handleDisableOrdering}
                  variant="secondary"
                />
              </View>
              <Button
                title="Novo Grupo"
                onPress={createNewGroup}
                variant="secondary"
              />
            </View>

            {groupsSignature.map((group, groupIndex) => (
              <GroupCard
                key={groupIndex}
                group={group}
                groupIndex={groupIndex}
                onRemoveParticipant={handleRemoveParticipant}
                onUpdateParticipantType={handleUpdateParticipantType}
                onUpdateValidation={handleUpdateValidation}
                onUpdateValidationICP={handleUpdateValidationICP}
                onEditPosition={handleEditPosition}
                onMoveParticipantUp={moveParticipantUp}
                onMoveParticipantDown={moveParticipantDown}
                onRemoveGroup={removeGroup}
                onSelectRule={selectGroupRule}
                onAddParticipantToGroup={(groupIndex) => {
                  setTargetGroupForNewParticipant(groupIndex);
                  setShowAddParticipantModal(true);
                }}
                hasDocuments={documents.length > 0}
                canMoveGroupUp={groupIndex > 0}
                canMoveGroupDown={groupIndex < groupsSignature.length - 1}
                onMoveGroupUp={moveGroupUp}
                onMoveGroupDown={moveGroupDown}
              />
            ))}
          </View>
        )}
      </View>

      {/* Botão Criar */}
      <View style={{ marginTop: 24, marginBottom: 40 }}>
        <Button
          title={loading ? 'Criando...' : 'Criar Assinatura'}
          onPress={handleCreateSignature}
          variant="primary"
          disabled={loading}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color="#4F6AF5"
            style={{ marginTop: 12 }}
          />
        )}
      </View>

      {/* Modals */}
      <AddParticipantModal
        visible={showAddParticipantModal}
        onClose={() => {
          setShowAddParticipantModal(false);
          setTargetGroupForNewParticipant(null);
        }}
        onAddInternal={handleAddInternalParticipant}
        onAddExternal={handleAddExternalParticipant}
        onSearchUsers={searchUsers}
      />

      <SignaturePositionEditor
        visible={showPositionEditor}
        participant={selectedParticipant}
        documents={documents}
        onClose={() => {
          setShowPositionEditor(false);
          setSelectedParticipant(null);
        }}
        onSave={handleSavePosition}
      />

      <RuleSelectModal
        visible={showRuleModal}
        onClose={() => {
          setShowRuleModal(false);
          setSelectedGroupIndex(null);
        }}
        onSelectRule={handleRuleSelect}
        currentRuleId={selectedGroupIndex !== null ? groupsSignature[selectedGroupIndex]?.ruleId : null}
      />

      <SelectFileFromCloud
        visible={showSelectFileModal}
        onClose={() => setShowSelectFileModal(false)}
        onSelectFiles={handleSelectFilesFromCloud}
      />
    </ScrollView>
  );
};

export default CreateSignature;