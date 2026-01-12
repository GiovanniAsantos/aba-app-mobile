import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelRequired: {
    color: '#ef4444',
  },
  uploadContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  uploadContainerActive: {
    borderColor: '#4F6AF5',
    backgroundColor: '#eff6ff',
  },
  uploadContainerError: {
    borderColor: '#ef4444',
  },
  uploadIcon: {
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
