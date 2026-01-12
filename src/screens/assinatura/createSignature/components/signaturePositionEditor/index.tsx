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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { Button } from '@/components';
import { styles } from './style';
import type { Participant, SignatureDocument, SignaturePosition } from '@/types/signature';

interface SignaturePositionEditorProps {
  visible: boolean;
  participant: Participant | null;
  documents: SignatureDocument[];
  onClose: () => void;
  onSave: (participant: Participant, positions: SignaturePosition[]) => void;
}

export function SignaturePositionEditor({
  visible,
  participant,
  documents,
  onClose,
  onSave,
}: SignaturePositionEditorProps) {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfWidth, setPdfWidth] = useState(0);
  const [pdfHeight, setPdfHeight] = useState(0);
  const [positions, setPositions] = useState<SignaturePosition[]>([]);
  const [rubricPositions, setRubricPositions] = useState<SignaturePosition[]>([]);
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<'signature' | 'rubric'>('signature');
  const [loading, setLoading] = useState(true);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const pdfRef = useRef<any>(null);

  // Initialize positions when modal opens
  React.useEffect(() => {
    if (visible && participant && documents.length > 0) {
      setCurrentPage(1);
      setLoading(true);
      const existingPositions = participant.signaturePosition?.docsAndPosition || [];
      const existingRubrics = participant.rubricPosition?.docsAndPosition || [];
      
      if (existingPositions.length > 0) {
        setPositions(existingPositions);
      }
      if (existingRubrics.length > 0) {
        setRubricPositions(existingRubrics);
      }
    }
  }, [visible, participant, documents, selectedDocIndex]);

  const getCurrentDoc = () => documents[selectedDocIndex];

  const getCurrentPositions = () => {
    const currentDoc = getCurrentDoc();
    if (!currentDoc) return [];

    const docKey = currentDoc.fileProps?.key || currentDoc.key;
    return (editMode === 'signature' ? positions : rubricPositions).filter(
      (pos) => pos.docKey === docKey && pos.docPage === currentPage
    );
  };

  const addPosition = () => {
    const currentDoc = getCurrentDoc();
    if (!currentDoc) return;

    const docKey = currentDoc.fileProps?.key || currentDoc.key || '';
    if (!docKey) return;
    
    const newPosition: SignaturePosition = {
      docKey,
      x: 50,
      y: 100,
      width: 200,
      height: 70,
      docHeight: pdfHeight,
      docWidth: pdfWidth,
      docPage: currentPage,
      positionConfirmed: false,
      participantId: participant?.idTemp || '',
    };

    if (editMode === 'signature') {
      setPositions((prev) => [...prev, newPosition]);
    } else {
      setRubricPositions((prev) => [...prev, newPosition]);
    }
  };

  const removePosition = (index: number) => {
    const currentPositions = getCurrentPositions();
    const posToRemove = currentPositions[index];
    
    if (editMode === 'signature') {
      setPositions((prev) => prev.filter((p) => p !== posToRemove));
    } else {
      setRubricPositions((prev) => prev.filter((p) => p !== posToRemove));
    }
  };

  const updatePositionAt = (index: number, updates: Partial<SignaturePosition>) => {
    const currentPositions = getCurrentPositions();
    const posToUpdate = currentPositions[index];
    
    if (editMode === 'signature') {
      setPositions((prev) =>
        prev.map((p) => (p === posToUpdate ? { ...p, ...updates } : p))
      );
    } else {
      setRubricPositions((prev) =>
        prev.map((p) => (p === posToUpdate ? { ...p, ...updates } : p))
      );
    }
  };

  // Create pan responder for each position
  const createPanResponder = (posIndex: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActivePosition(posIndex);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentPositions = getCurrentPositions();
        const currentPos = currentPositions[posIndex];
        if (!currentPos) return;

        updatePositionAt(posIndex, {
          x: Math.max(0, Math.min(pdfWidth - currentPos.width, currentPos.x + gestureState.dx)),
          y: Math.max(0, Math.min(pdfHeight - currentPos.height, currentPos.y + gestureState.dy)),
        });
      },
      onPanResponderRelease: () => {
        setActivePosition(null);
      },
    });

  const handleConfirmAll = () => {
    // Confirm all positions for current document and page
    const currentPositions = getCurrentPositions();
    currentPositions.forEach((_, index) => {
      updatePositionAt(index, { positionConfirmed: true });
    });

    Alert.alert('Sucesso', 'Posições confirmadas!');
  };

  const handleSave = () => {
    if (!participant) return;

    const updatedParticipant: Participant = {
      ...participant,
      signaturePosition: {
        positionDefined: positions.length > 0,
        docsAndPosition: positions,
      },
      rubricPosition: {
        ...participant.rubricPosition,
        rubricOption: rubricPositions.length > 0 ? 'REQUIRED_SIGN' : 'NOT_SIGN',
        positionDefined: rubricPositions.length > 0,
        docsAndPosition: rubricPositions,
        allPages: false,
      },
    };

    onSave(updatedParticipant, positions);
    onClose();
  };

  const handleSkip = () => {
    if (!participant) return;

    Alert.alert(
      'Posição Opcional',
      'Sem posição definida, o participante poderá escolher onde assinar. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const updatedParticipant: Participant = {
              ...participant,
              signaturePosition: {
                positionDefined: false,
                docsAndPosition: [],
              },
            };
            onSave(updatedParticipant, []);
            onClose();
          },
        },
      ]
    );
  };

  const currentDoc = getCurrentDoc();
  const currentPositions = getCurrentPositions();
  const docUri = currentDoc?.fileProps?.uri || '';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.positionEditorContainer}>
        {/* Header */}
        <View style={styles.positionEditorHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.positionEditorTitle}>Posicionar - {participant?.name}</Text>
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
                onPress={() => {
                  setSelectedDocIndex(index);
                  setCurrentPage(1);
                  setLoading(true);
                }}
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
        <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
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
              Assinatura ({positions.filter(p => p.docKey === (currentDoc?.fileProps?.key || currentDoc?.key)).length})
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
              Rubrica ({rubricPositions.filter(p => p.docKey === (currentDoc?.fileProps?.key || currentDoc?.key)).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Page Navigation */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.3 : 1 }}
          >
            <MaterialCommunityIcons name="chevron-left" size={32} color="#4F6AF5" />
          </TouchableOpacity>
          <Text style={{ fontSize: 14, fontWeight: '600' }}>
            Página {currentPage} de {totalPages}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.3 : 1 }}
          >
            <MaterialCommunityIcons name="chevron-right" size={32} color="#4F6AF5" />
          </TouchableOpacity>
        </View>

        {/* PDF Viewer with overlay */}
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          {docUri ? (
            <>
              <Pdf
                ref={pdfRef}
                source={{ uri: docUri, cache: true }}
                page={currentPage}
                onLoadComplete={(numberOfPages, filePath) => {
                  setTotalPages(numberOfPages);
                  setLoading(false);
                }}
                onPageChanged={(page, numberOfPages) => {
                  setCurrentPage(page);
                }}
                onError={(error) => {
                  console.error('PDF Error:', error);
                  setLoading(false);
                  Alert.alert('Erro', 'Não foi possível carregar o PDF');
                }}
                style={{ flex: 1 }}
                onPageSingleTap={() => {
                  addPosition();
                }}
                onScaleChanged={(scale) => {
                  // Poderia ajustar baseado no zoom
                }}
                onLoadProgress={(percent) => {
                  // Could show progress
                }}
                enablePaging={false}
                horizontal={false}
              />
              
              {loading && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.8)' }}>
                  <ActivityIndicator size="large" color="#4F6AF5" />
                  <Text style={{ marginTop: 8, color: '#666' }}>Carregando PDF...</Text>
                </View>
              )}

              {/* Position markers overlay */}
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
                {currentPositions.map((pos, index) => {
                  const panResponder = createPanResponder(index);
                  return (
                    <View
                      key={`${pos.docKey}-${pos.docPage}-${index}`}
                      {...panResponder.panHandlers}
                      style={{
                        position: 'absolute',
                        left: pos.x,
                        top: pos.y,
                        width: pos.width,
                        height: pos.height,
                        borderWidth: 2,
                        borderColor: activePosition === index ? '#4F6AF5' : editMode === 'signature' ? '#52c41a' : '#faad14',
                        borderStyle: 'dashed',
                        backgroundColor: activePosition === index ? 'rgba(79, 106, 245, 0.2)' : editMode === 'signature' ? 'rgba(82, 196, 26, 0.15)' : 'rgba(250, 173, 20, 0.15)',
                        borderRadius: 4,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <TouchableOpacity
                        style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#f5222d', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => removePosition(index)}
                      >
                        <MaterialCommunityIcons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                      <MaterialCommunityIcons
                        name={editMode === 'signature' ? 'draw' : 'signature-freehand'}
                        size={24}
                        color={editMode === 'signature' ? '#52c41a' : '#faad14'}
                      />
                      <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                        {editMode === 'signature' ? 'Assinatura' : 'Rubrica'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialCommunityIcons name="file-pdf-box" size={64} color="#ccc" />
              <Text style={{ marginTop: 16, color: '#999' }}>Documento não disponível</Text>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="Adicionar"
              onPress={addPosition}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Confirmar Posições"
              onPress={handleConfirmAll}
              variant="primary"
              style={{ flex: 1 }}
              disabled={currentPositions.length === 0}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="Posição Opcional"
              onPress={handleSkip}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title="Salvar e Fechar"
              onPress={handleSave}
              variant="primary"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
