import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  positionEditorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  positionEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  positionEditorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  positionEditorDocumentSelector: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  positionEditorCanvas: {
    flex: 1,
    position: 'relative',
  },
  signatureMarker: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#4F6AF5',
    borderRadius: 4,
    backgroundColor: 'rgba(79, 106, 245, 0.1)',
  },
  signatureMarkerActive: {
    borderColor: '#f44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  signatureMarkerLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    backgroundColor: '#4F6AF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  signatureMarkerLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  positionEditorFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});
