import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container
  envContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Header (padrão do app)
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4F6AF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F6AF5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    shadowColor: '#4F6AF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Tabs
  tabsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4F6AF5',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Content
  envContent: {
    flex: 1,
  },
  tabContent: {
  },

  // Environment Card
  envCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  envCardCurrent: {
    borderWidth: 2,
    borderColor: '#4F6AF5',
    backgroundColor: '#f0f4ff',
  },
  envCardContent: {
    flexDirection: 'row',
    gap: 12,
  },

  // Avatar
  envAvatar: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envAvatarDefault: {
    backgroundColor: '#e5e7eb',
  },
  envAvatarAssociated: {
    backgroundColor: '#fef3c7',
  },
  envAvatarCurrent: {
    backgroundColor: '#4F6AF5',
  },
  envAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },

  // Info
  envInfo: {
    flex: 1,
    gap: 10,
  },
  envHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  envTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  envName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  currentBadge: {
    backgroundColor: '#4F6AF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgePending: {
    backgroundColor: '#dbeafe',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadgeTextActive: {
    color: '#15803d',
  },
  statusBadgeTextPending: {
    color: '#1d4ed8',
  },

  // API Key
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiKeyBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  apiKeyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Enter Button
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F6AF5',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  enterButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  enterButtonCurrent: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4F6AF5',
  },
  enterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  enterButtonTextCurrent: {
    color: '#4F6AF5',
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  formDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 18,
  },
  formContent: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F6AF5',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Invite Tabs
  inviteTabsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  inviteTabs: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 4,
    margin: 12,
    borderRadius: 10,
  },
  inviteTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  inviteTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inviteTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  inviteTabTextActive: {
    color: '#4F6AF5',
    fontWeight: '600',
  },
  inviteTabContent: {
    padding: 12,
  },

  // Invite Card
  inviteCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inviteInfo: {
    flex: 1,
    gap: 6,
  },
  inviteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  inviteKeyBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignSelf: 'flex-start',
  },
  inviteKeyText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  inviteStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#dbeafe',
    gap: 4,
  },
  inviteStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  inviteDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
});
