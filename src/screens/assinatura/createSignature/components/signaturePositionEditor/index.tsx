import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PanResponder,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { Button } from '@/components';
import { styles } from './style';
import { api, apiCloudUrl, apiSignatureUrlV1 } from '@/config/api';
import { useAuth } from '@/context/AuthProvider';
import type { Participant, SignatureDocument, SignaturePosition } from '@/types/signature';

interface SignaturePositionEditorProps {
  visible: boolean;
  allParticipants: Participant[]; // Alterado para receber todos os participantes
  documents: SignatureDocument[];
  signatureId?: string; // ID da assinatura (opcional, para edição)
  onClose: () => void;
  onSaveAll: (participants: Participant[]) => void; // Salva todos os participantes de uma vez
}

export function SignaturePositionEditor({
  visible,
  allParticipants,
  documents,
  signatureId,
  onClose,
  onSaveAll,
}: SignaturePositionEditorProps) {
  const { tokens } = useAuth();
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfWidth, setPdfWidth] = useState(0);
  const [pdfHeight, setPdfHeight] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [editMode, setEditMode] = useState<'signature' | 'rubric'>('signature');
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [showParticipantSelector, setShowParticipantSelector] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const pdfRef = useRef<any>(null);

  // Initialize participants when modal opens
  React.useEffect(() => {
    if (visible && allParticipants && documents.length > 0) {
      setParticipants(JSON.parse(JSON.stringify(allParticipants))); // Deep clone
      setCurrentPage(1);
      setSelectedDocIndex(0);
      loadDocumentBase64(documents[0]);
    }
  }, [visible, allParticipants, documents]);

  const getCurrentDoc = () => documents[selectedDocIndex];

  // Carregar documento da API usando doc-key ou URI local
  const loadDocumentBase64 = async (doc: SignatureDocument) => {
    if (!doc) {
      Alert.alert('Erro', 'Documento inválido');
      return;
    }

    setLoadingDoc(true);
    setPdfBase64(null);

    try {
      // Se já tem URI local (arquivo recém adicionado), usa diretamente
      if (doc.fileProps?.uri) {
        setPdfBase64(doc.fileProps.uri);
        setLoadingDoc(false);
        return;
      }

      // Buscar documento da nuvem usando doc-key
      const docKey = doc.fileProps?.key || doc.key;
      
      if (!docKey) {
        throw new Error('Documento sem identificador (key) válido');
      }

      const response = await fetch(
        `${apiCloudUrl}/files/${docKey}/download`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokens?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar documento: ${response.status}`);
      }

      // Converter response para blob e depois para base64
      const blob = await response.blob();
      
      // Usar FileReader para converter blob em base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        
        // Garantir que o MIME type seja application/pdf
        let pdfData = base64Data;
        if (base64Data.startsWith('data:application/octet-stream')) {
          pdfData = base64Data.replace(
            'data:application/octet-stream',
            'data:application/pdf'
          );
        }
        
        setPdfBase64(pdfData);
        setLoadingDoc(false);
      };
      reader.onerror = () => {
        Alert.alert('Erro', 'Falha ao converter documento');
        setLoadingDoc(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erro ao carregar documento:', error);
      Alert.alert('Erro', 'Falha ao carregar documento da nuvem');
      setLoadingDoc(false);
    }
  };

  // Obter todas as posições (assinaturas e rubricas) da página atual
  const getCurrentPagePositions = () => {
    const currentDoc = getCurrentDoc();
    if (!currentDoc) return [];

    const docKey = currentDoc.fileProps?.key || currentDoc.key;
    const allPositions: Array<{
      participant: Participant;
      position: SignaturePosition;
      type: 'signature' | 'rubric';
    }> = [];

    participants.forEach((part) => {
      // Assinaturas
      part.signaturePosition?.docsAndPosition?.forEach((pos) => {
        if (pos.docKey === docKey && pos.docPage === currentPage) {
          allPositions.push({ participant: part, position: pos, type: 'signature' });
        }
      });

      // Rubricas
      part.rubricPosition?.docsAndPosition?.forEach((pos) => {
        if (pos.docKey === docKey && pos.docPage === currentPage) {
          allPositions.push({ participant: part, position: pos, type: 'rubric' });
        }
      });
    });

    return allPositions;
  };

  // Verificar se participante já tem posição neste documento/página
  const hasPositionForParticipant = (participantId: string, type: 'signature' | 'rubric') => {
    const currentDoc = getCurrentDoc();
    if (!currentDoc) return false;

    const docKey = currentDoc.fileProps?.key || currentDoc.key;
    const participant = participants.find((p) => p.idTemp === participantId);
    if (!participant) return false;

    if (type === 'signature') {
      return participant.signaturePosition?.docsAndPosition?.some(
        (pos) => pos.docKey === docKey && pos.docPage === currentPage
      );
    } else {
      return participant.rubricPosition?.docsAndPosition?.some(
        (pos) => pos.docKey === docKey && pos.docPage === currentPage
      );
    }
  };

  // Obter todos os participantes (incluindo os que já têm posição)
  const getAvailableParticipants = () => {
    // Retornar todos os participantes para permitir reposicionar
    return participants;
  };

  // Verificar quantos participantes ainda não têm posição
  const getParticipantsWithoutPosition = () => {
    return participants.filter((part) => !hasPositionForParticipant(part.idTemp || '', editMode));
  };

  // Handler do clique no PDF
  const handlePdfPress = (event: any) => {
    if (!pdfBase64 || loadingDoc) return;

    // Obter as coordenadas do toque - suporta múltiplos formatos de evento
    let locationX: number | undefined;
    let locationY: number | undefined;

    // Tentar obter coordenadas de diferentes estruturas de evento
    if (event.nativeEvent) {
      // Evento padrão do React Native
      locationX = event.nativeEvent.locationX ?? event.nativeEvent.pageX;
      locationY = event.nativeEvent.locationY ?? event.nativeEvent.pageY;
      
      // Se tiver changedTouches (touch events)
      if (!locationX && event.nativeEvent.changedTouches?.[0]) {
        const touch = event.nativeEvent.changedTouches[0];
        locationX = touch.locationX ?? touch.pageX;
        locationY = touch.locationY ?? touch.pageY;
      }
    } else if (event.changedTouches?.[0]) {
      // Evento de toque direto
      const touch = event.changedTouches[0];
      locationX = touch.locationX ?? touch.pageX;
      locationY = touch.locationY ?? touch.pageY;
    }

    // Validar se temos coordenadas válidas
    if (locationX === undefined || locationY === undefined || typeof locationX !== 'number' || typeof locationY !== 'number') {
      console.error('Coordenadas do toque inválidas:', event);
      return;
    }

    console.log('Toque detectado em:', { locationX, locationY });

    // Verificar se há participantes disponíveis
    const available = getAvailableParticipants();
    if (available.length === 0) {
      Alert.alert(
        'Sem participantes',
        'Não há participantes para posicionar.'
      );
      return;
    }

    setPendingPosition({ x: locationX, y: locationY });
    setShowParticipantSelector(true);
  };

  // Adicionar ou atualizar posição para participante selecionado
  const addPositionForParticipant = (participantId: string) => {
    if (!pendingPosition) return;

    const currentDoc = getCurrentDoc();
    if (!currentDoc) return;

    const docKey = currentDoc.fileProps?.key || currentDoc.key || '';
    const { x, y } = pendingPosition;

    const newPosition: SignaturePosition = {
      docKey,
      x: Math.max(0, Math.min(pdfWidth - 100, x)),
      y: Math.max(0, Math.min(pdfHeight - 35, y)),
      width: editMode === 'signature' ? 100 : 50,
      height: editMode === 'signature' ? 35 : 25,
      docHeight: pdfHeight,
      docWidth: pdfWidth,
      docPage: currentPage,
      positionConfirmed: true,
      participantId,
    };

    setParticipants((prev) =>
      prev.map((part) => {
        if (part.idTemp === participantId) {
          if (editMode === 'signature') {
            // Remover posição existente nesta página/documento antes de adicionar nova
            const existingPositions = part.signaturePosition?.docsAndPosition || [];
            const filteredPositions = existingPositions.filter(
              (pos) => !(pos.docKey === docKey && pos.docPage === currentPage)
            );

            return {
              ...part,
              signaturePosition: {
                ...part.signaturePosition,
                positionDefined: true,
                docsAndPosition: [...filteredPositions, newPosition],
              },
            };
          } else {
            // Remover posição existente nesta página/documento antes de adicionar nova
            const existingPositions = part.rubricPosition?.docsAndPosition || [];
            const filteredPositions = existingPositions.filter(
              (pos) => !(pos.docKey === docKey && pos.docPage === currentPage)
            );

            return {
              ...part,
              rubricPosition: {
                ...part.rubricPosition,
                rubricOption: 'REQUIRED_SIGN',
                positionDefined: true,
                allPages: false,
                docsAndPosition: [...filteredPositions, newPosition],
              },
            };
          }
        }
        return part;
      })
    );

    setPendingPosition(null);
    setShowParticipantSelector(false);
  };

  // Remover posição específica
  const removePosition = (participantId: string, positionIndex: number, type: 'signature' | 'rubric') => {
    Alert.alert(
      'Remover',
      `Deseja remover esta ${type === 'signature' ? 'assinatura' : 'rubrica'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setParticipants((prev) =>
              prev.map((part) => {
                if (part.idTemp === participantId) {
                  if (type === 'signature') {
                    const newPositions = [...(part.signaturePosition?.docsAndPosition || [])];
                    newPositions.splice(positionIndex, 1);
                    return {
                      ...part,
                      signaturePosition: {
                        ...part.signaturePosition,
                        docsAndPosition: newPositions,
                        positionDefined: newPositions.length > 0,
                      },
                    };
                  } else {
                    const newPositions = [...(part.rubricPosition?.docsAndPosition || [])];
                    newPositions.splice(positionIndex, 1);
                    return {
                      ...part,
                      rubricPosition: {
                        ...part.rubricPosition,
                        docsAndPosition: newPositions,
                        positionDefined: newPositions.length > 0,
                        rubricOption: newPositions.length > 0 ? 'REQUIRED_SIGN' : 'NOT_SIGN',
                      },
                    };
                  }
                }
                return part;
              })
            );
          },
        },
      ]
    );
  };

  // Atualizar posição ao arrastar
  const updatePosition = (participantId: string, posIndex: number, type: 'signature' | 'rubric', deltaX: number, deltaY: number) => {
    setParticipants((prev) =>
      prev.map((part) => {
        if (part.idTemp === participantId) {
          if (type === 'signature') {
            const newPositions = [...(part.signaturePosition?.docsAndPosition || [])];
            if (newPositions[posIndex]) {
              newPositions[posIndex] = {
                ...newPositions[posIndex],
                x: Math.max(0, Math.min(pdfWidth - newPositions[posIndex].width, newPositions[posIndex].x + deltaX)),
                y: Math.max(0, Math.min(pdfHeight - newPositions[posIndex].height, newPositions[posIndex].y + deltaY)),
              };
            }
            return {
              ...part,
              signaturePosition: {
                ...part.signaturePosition,
                docsAndPosition: newPositions,
              },
            };
          } else {
            const newPositions = [...(part.rubricPosition?.docsAndPosition || [])];
            if (newPositions[posIndex]) {
              newPositions[posIndex] = {
                ...newPositions[posIndex],
                x: Math.max(0, Math.min(pdfWidth - newPositions[posIndex].width, newPositions[posIndex].x + deltaX)),
                y: Math.max(0, Math.min(pdfHeight - newPositions[posIndex].height, newPositions[posIndex].y + deltaY)),
              };
            }
            return {
              ...part,
              rubricPosition: {
                ...part.rubricPosition,
                docsAndPosition: newPositions,
              },
            };
          }
        }
        return part;
      })
    );
  };

  // Criar PanResponder para arrastar posições
  const createPanResponder = (participantId: string, posIndex: number, type: 'signature' | 'rubric') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        updatePosition(participantId, posIndex, type, gestureState.dx, gestureState.dy);
      },
    });

  const handleSave = () => {
    onSaveAll(participants);
    onClose();
  };

  const handleChangeDocument = (index: number) => {
    setSelectedDocIndex(index);
    setCurrentPage(1);
    loadDocumentBase64(documents[index]);
  };

  const currentDoc = getCurrentDoc();
  const currentPagePositions = getCurrentPagePositions();
  const availableParticipants = getAvailableParticipants();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.positionEditorContainer}>
        {/* Header */}
        <View style={styles.positionEditorHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.positionEditorTitle}>Posicionar Assinaturas</Text>
          <TouchableOpacity onPress={handleSave}>
            <MaterialCommunityIcons name="check" size={24} color="#4F6AF5" />
          </TouchableOpacity>
        </View>

        {/* Document Selector */}
        {documents.length > 1 && (
          <ScrollView
            horizontal
            style={styles.positionEditorDocumentSelector}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
            showsHorizontalScrollIndicator={false}
          >
            {documents.map((doc, index) => (
              <TouchableOpacity
                key={doc.fileProps?.key || doc.key || index}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: selectedDocIndex === index ? '#4F6AF5' : '#f5f5f5',
                }}
                onPress={() => handleChangeDocument(index)}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedDocIndex === index ? '#fff' : '#666',
                    fontWeight: selectedDocIndex === index ? '600' : '400',
                  }}
                  numberOfLines={1}
                >
                  {doc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Mode Selector */}
        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: editMode === 'signature' ? '#4F6AF5' : '#f5f5f5',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={() => setEditMode('signature')}
            >
              <MaterialCommunityIcons
                name="draw"
                size={20}
                color={editMode === 'signature' ? '#fff' : '#666'}
              />
              <Text style={{ color: editMode === 'signature' ? '#fff' : '#666', fontWeight: '600' }}>
                Assinatura
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: editMode === 'rubric' ? '#4F6AF5' : '#f5f5f5',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onPress={() => setEditMode('rubric')}
            >
              <MaterialCommunityIcons
                name="signature-freehand"
                size={20}
                color={editMode === 'rubric' ? '#fff' : '#666'}
              />
              <Text style={{ color: editMode === 'rubric' ? '#fff' : '#666', fontWeight: '600' }}>
                Rubrica
              </Text>
            </TouchableOpacity>
          </View>

          {/* Informação */}
          <View style={{ backgroundColor: '#e6f7ff', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#1890ff' }}>
            <Text style={{ fontSize: 12, color: '#0050b3', lineHeight: 18 }}>
              💡 Toque no PDF para adicionar {editMode === 'signature' ? 'assinatura' : 'rubrica'}. Disponíveis: {availableParticipants.length}
            </Text>
          </View>
        </View>

        {/* Page Navigation */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => {
              if (pdfRef.current && currentPage > 1) {
                pdfRef.current.setPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#4F6AF5" />
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>
            Página {currentPage} de {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (pdfRef.current && currentPage < totalPages) {
                pdfRef.current.setPage(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.3 : 1 }}
          >
            <MaterialCommunityIcons name="chevron-right" size={32} color="#4F6AF5" />
          </TouchableOpacity>
        </View>

        {/* PDF Viewer with overlay */}
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          {pdfBase64 ? (
            <>
              <View style={{ flex: 1 }} onTouchEnd={handlePdfPress}>
                <Pdf
                  ref={pdfRef}
                  source={{ uri: pdfBase64, cache: true }}
                  page={currentPage}
                  onLoadComplete={(numberOfPages, filePath, { width, height }) => {
                    console.log('PDF carregado:', { numberOfPages, width, height });
                    setTotalPages(numberOfPages);
                    // Capturar dimensões do PDF em escala 1:1
                    if (width && height) {
                      setPdfWidth(width);
                      setPdfHeight(height);
                    }
                    setLoading(false);
                  }}
                  onPageChanged={(page) => {
                    setCurrentPage(page);
                  }}
                  onError={(error) => {
                    console.error('PDF Error:', error);
                    setLoading(false);
                    Alert.alert('Erro', 'Não foi possível carregar o PDF');
                  }}
                  style={{ flex: 1, width: screenWidth, backgroundColor: '#fff' }}
                  enablePaging={false}
                  horizontal={false}
                  onLoadProgress={(percent) => {
                    if (percent === 1) setLoadingDoc(false);
                  }}
                />
              </View>

              {(loading || loadingDoc) && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  <ActivityIndicator size="large" color="#4F6AF5" />
                  <Text style={{ marginTop: 8, color: '#666' }}>Carregando documento...</Text>
                </View>
              )}

              {/* Position markers overlay */}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
                {currentPagePositions.map(({ participant, position, type }, index) => {
                  const posIndex = type === 'signature'
                    ? participant.signaturePosition?.docsAndPosition?.indexOf(position) || 0
                    : participant.rubricPosition?.docsAndPosition?.indexOf(position) || 0;
                  const panResponder = createPanResponder(participant.idTemp || '', posIndex, type);

                  return (
                    <View
                      key={`${participant.idTemp}-${type}-${index}`}
                      {...panResponder.panHandlers}
                      style={{
                        position: 'absolute',
                        left: position.x,
                        top: position.y,
                        width: position.width,
                        height: position.height,
                        borderWidth: 3,
                        borderColor: type === 'signature' ? '#52c41a' : '#faad14',
                        borderStyle: 'dashed',
                        backgroundColor: type === 'signature' ? 'rgba(82, 196, 26, 0.2)' : 'rgba(250, 173, 20, 0.2)',
                        borderRadius: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 4,
                      }}
                    >
                      <TouchableOpacity
                        style={{ position: 'absolute', top: -10, right: -10, backgroundColor: '#f5222d', borderRadius: 14, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}
                        onPress={() => removePosition(participant.idTemp || '', posIndex, type)}
                      >
                        <MaterialCommunityIcons name="close" size={18} color="#fff" />
                      </TouchableOpacity>
                      <MaterialCommunityIcons
                        name={type === 'signature' ? 'draw' : 'signature-freehand'}
                        size={24}
                        color={type === 'signature' ? '#52c41a' : '#faad14'}
                      />
                      <Text style={{ fontSize: 10, color: '#333', marginTop: 2, fontWeight: '600', textAlign: 'center' }} numberOfLines={2}>
                        {participant.name}
                      </Text>
                      <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                        Arraste para mover
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4F6AF5" />
              <Text style={{ marginTop: 16, color: '#999' }}>Carregando documento...</Text>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ fontSize: 14, color: '#666' }}>
              {currentPagePositions.length} posição(ões) nesta página
            </Text>
            <Text style={{ fontSize: 12, color: getParticipantsWithoutPosition().length === 0 ? '#52c41a' : '#fa8c16', fontWeight: '600' }}>
              {getParticipantsWithoutPosition().length === 0 
                ? '✓ Todos posicionados' 
                : `${getParticipantsWithoutPosition().length} pendente(s)`}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#4F6AF5' }}>
              {availableParticipants.length} disponível(eis)
            </Text>
          </View>

          <Button
            title="Salvar e Fechar"
            onPress={handleSave}
            variant="primary"
          />
        </View>

        {/* Participant Selector Modal */}
        <Modal
          visible={showParticipantSelector}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowParticipantSelector(false);
            setPendingPosition(null);
          }}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={1}
            onPress={() => {
              setShowParticipantSelector(false);
              setPendingPosition(null);
            }}
          >
            <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '90%', maxHeight: '70%' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' }}>
                Selecione o Participante
              </Text>

              <FlatList
                data={availableParticipants}
                keyExtractor={(item) => item.idTemp || ''}
                renderItem={({ item }) => {
                  const hasPosition = hasPositionForParticipant(item.idTemp || '', editMode);
                  return (
                    <TouchableOpacity
                      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      onPress={() => addPositionForParticipant(item.idTemp || '')}
                    >
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: hasPosition ? '#52c41a' : '#4F6AF5', justifyContent: 'center', alignItems: 'center' }}>
                        {hasPosition ? (
                          <MaterialCommunityIcons name="check" size={24} color="#fff" />
                        ) : (
                          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                            {item.name?.charAt(0)?.toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{item.name}</Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{item.email}</Text>
                        {hasPosition && (
                          <Text style={{ fontSize: 10, color: '#52c41a', marginTop: 4, fontWeight: '600' }}>
                            ✓ Já possui posição (clique para redefinir)
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: '#999', padding: 20 }}>
                    Nenhum participante disponível
                  </Text>
                }
              />

              <TouchableOpacity
                style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, alignItems: 'center' }}
                onPress={() => {
                  setShowParticipantSelector(false);
                  setPendingPosition(null);
                }}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}
