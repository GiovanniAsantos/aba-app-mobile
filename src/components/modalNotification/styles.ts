import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    // Modal de Notificações
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    unreadCount: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        marginTop: 2,
    },
    modalCloseButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    notificationItemUnread: {
        backgroundColor: '#f9fafb',
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    notificationIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationDetails: {
        flex: 1,
    },
    notificationTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4F6AF5',
        marginLeft: 8,
    },
    notificationDescription: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: '#9ca3af',
    },
    markAllReadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 20,
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
    },
    markAllReadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F6AF5',
    },
});
