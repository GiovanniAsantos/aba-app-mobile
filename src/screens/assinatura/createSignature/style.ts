import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tabContent: {
    paddingBottom: 100,
  },
  createSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  configCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  configInfo: {
    flex: 1,
  },
  configTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  configSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});