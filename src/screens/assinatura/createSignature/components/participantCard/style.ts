 import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  participantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F6AF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  participantEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  participantCpf: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  participantRemoveButton: {
    padding: 8,
  },
  participantConfigSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  participantConfigRow: {
    marginBottom: 12,
  },
  participantConfigLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  participantTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  participantTypeText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  participantValidationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  participantValidationText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  participantPositionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F6AF5',
    padding: 12,
    borderRadius: 8,
  },
  participantPositionButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  participantPositionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  participantPositionStatusText: {
    fontSize: 12,
    color: '#666',
  },
});