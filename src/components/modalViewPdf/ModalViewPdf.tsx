import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { styles } from './style';

interface ModalViewPdfProps {
  visible: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName?: string;
}

export default function ModalViewPdf({
  visible,
  onClose,
  pdfUrl,
  fileName = 'document.pdf',
}: ModalViewPdfProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = React.useRef<any>(null);

  const handleLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
    setLoading(false);
  };

  const handlePageChanged = (page: number) => {
    setCurrentPage(page);
  };

  const goToFirstPage = () => {
    if (pdfRef.current && currentPage > 1) {
      pdfRef.current.setPage(1);
    }
  };

  const goToPreviousPage = () => {
    if (pdfRef.current && currentPage > 1) {
      pdfRef.current.setPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pdfRef.current && currentPage < totalPages) {
      pdfRef.current.setPage(currentPage + 1);
    }
  };

  const goToLastPage = () => {
    if (pdfRef.current && currentPage < totalPages) {
      pdfRef.current.setPage(totalPages);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Remove data:application/pdf;base64, prefix if exists
      let base64Data = pdfUrl;
      if (pdfUrl.startsWith('data:application/pdf;base64,')) {
        base64Data = pdfUrl.replace('data:application/pdf;base64,', '');
      }

      const { dirs } = ReactNativeBlobUtil.fs;
      const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filePath = `${dirToSave}/${fileName}`;

      // Write file
      await ReactNativeBlobUtil.fs.writeFile(filePath, base64Data, 'base64');

      // Share or notify
      if (Platform.OS === 'android') {
        // On Android, open the file
        await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/pdf');
        Alert.alert('Sucesso', 'Documento baixado e aberto!');
      } else {
        // On iOS, use share sheet
        await ReactNativeBlobUtil.ios.previewDocument(filePath);
        Alert.alert('Sucesso', 'Documento salvo com sucesso!');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Erro', 'Falha ao baixar documento');
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    setCurrentPage(1);
    setTotalPages(0);
    setLoading(true);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{fileName}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* PDF Viewer */}
        <View style={styles.pdfContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F6AF5" />
              <Text style={styles.loadingText}>Carregando documento...</Text>
            </View>
          )}

          <Pdf
            ref={pdfRef}
            source={{ uri: pdfUrl }}
            style={styles.pdf}
            onLoadComplete={handleLoadComplete}
            onPageChanged={handlePageChanged}
            onError={(error) => {
              console.error('PDF Error:', error);
              Alert.alert('Erro', 'Falha ao carregar documento');
              setLoading(false);
            }}
            trustAllCerts={false}
            enablePaging={true}
            spacing={0}
            page={currentPage}
          />
        </View>

        {/* Footer with pagination and download */}
        <View style={styles.footer}>
          {/* Pagination */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              onPress={goToFirstPage}
              disabled={currentPage === 1}
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.paginationButtonDisabled,
              ]}
            >
              <Text style={styles.paginationButtonText}>{'<<'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToPreviousPage}
              disabled={currentPage === 1}
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.paginationButtonDisabled,
              ]}
            >
              <Text style={styles.paginationButtonText}>{'<'}</Text>
            </TouchableOpacity>

            <Text style={styles.pageText}>
              {currentPage} / {totalPages}
            </Text>

            <TouchableOpacity
              onPress={goToNextPage}
              disabled={currentPage === totalPages}
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled,
              ]}
            >
              <Text style={styles.paginationButtonText}>{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToLastPage}
              disabled={currentPage === totalPages}
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.paginationButtonDisabled,
              ]}
            >
              <Text style={styles.paginationButtonText}>{'>>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Download Button */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading || loading}
            style={[
              styles.downloadButton,
              (downloading || loading) && styles.downloadButtonDisabled,
            ]}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.downloadButtonText}>Baixar PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
