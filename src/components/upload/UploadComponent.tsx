import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { styles } from './style';

interface UploadProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  onFileSelect: (file: DocumentPicker.DocumentPickerAsset | null) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

export default function Upload({
  label,
  required = false,
  error,
  helperText,
  onFileSelect,
  acceptedTypes = ['*/*'],
  maxSizeMB = 10,
}: UploadProps) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Validar tamanho do arquivo
      const fileSizeMB = (file.size || 0) / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        Alert.alert(
          'Arquivo muito grande',
          `O arquivo deve ter no máximo ${maxSizeMB}MB. Tamanho atual: ${fileSizeMB.toFixed(2)}MB`
        );
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    } catch (err) {
      console.error('Erro ao selecionar arquivo:', err);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  const getContainerStyle = () => {
    const containerStyles: any[] = [styles.uploadContainer];
    if (isDragging) containerStyles.push(styles.uploadContainerActive);
    if (error) containerStyles.push(styles.uploadContainerError);
    return containerStyles;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={getContainerStyle()}
        onPress={handlePickDocument}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="cloud-upload-outline"
          size={48}
          color={error ? '#ef4444' : '#4F6AF5'}
          style={styles.uploadIcon}
        />
        <Text style={styles.uploadText}>Toque para selecionar arquivo</Text>
        <Text style={styles.uploadSubtext}>
          Tamanho máximo: {maxSizeMB}MB
        </Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.filePreview}>
          <MaterialCommunityIcons name="file-document" size={32} color="#4F6AF5" />
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(selectedFile.size || 0)}
            </Text>
          </View>
          <TouchableOpacity onPress={handleRemoveFile} style={styles.removeButton}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}
