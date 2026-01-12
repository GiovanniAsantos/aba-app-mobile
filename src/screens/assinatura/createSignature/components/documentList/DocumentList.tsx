import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components';
import { styles } from './style';
import type { SignatureDocument } from '@/types/signature';

interface DocumentListProps {
  documents: SignatureDocument[];
  onAddDocument: () => void;
  onRemoveDocument: (docKey: string) => void;
  onViewDocument: (doc: SignatureDocument) => void;
  loading?: boolean;
  readOnly?: boolean;
}

export function DocumentList({
  documents,
  onAddDocument,
  onRemoveDocument,
  onViewDocument,
  loading = false,
  readOnly = false,
}: DocumentListProps) {
  const handleRemove = (docKey: string, docName: string) => {
    Alert.alert(
      'Remover Documento',
      `Deseja remover o documento "${docName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onRemoveDocument(docKey),
        },
      ]
    );
  };

  return (
    <View style={styles.documentListContainer}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentHeaderTitle}>Documentos</Text>
        {!readOnly && (
          <Button
            title="Adicionar"
            onPress={onAddDocument}
            variant="primary"
          />
        )}
      </View>

      <ScrollView style={styles.documentScrollView}>
        {documents.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyDocumentState}
            onPress={!readOnly ? onAddDocument : undefined}
            disabled={readOnly}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color="#ccc"
            />
            <Text style={styles.emptyDocumentText}>
              Nenhum documento adicionado
            </Text>
            {!readOnly && (
              <Text style={styles.emptyDocumentSubtext}>
                Toque aqui para adicionar documentos
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          documents.map((doc) => (
            <View key={doc.fileProps?.key || doc.key} style={styles.documentItem}>
              <TouchableOpacity
                style={styles.documentContent}
                onPress={() => onViewDocument(doc)}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={24}
                  color="#f44336"
                />
                <Text style={styles.documentName} numberOfLines={2}>
                  {doc.name}
                </Text>
              </TouchableOpacity>

              {!readOnly && (
                <TouchableOpacity
                  style={styles.documentRemoveButton}
                  onPress={() =>
                    handleRemove(
                      doc.fileProps?.key || doc.key || '',
                      doc.name
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="#f44336"
                  />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
