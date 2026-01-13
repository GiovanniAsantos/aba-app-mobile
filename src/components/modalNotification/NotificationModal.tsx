import { Modal, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import { styles } from "./styles";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { apiAccountUrlV1 } from "@/config/api";
import { useAuth } from "@/context/AuthProvider";
import type { Notification, NotificationResponse } from "@/types/notification";

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const NotificationModal = ({ visible, onClose, onRefresh }: NotificationModalProps) => {
  const { tokens } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);

  // Carrega notificações ao abrir o modal
  useEffect(() => {
    if (visible) {
      console.log('📢 Modal aberto - Carregando notificações');
      loadNotifications(0, true);
    }
  }, [visible]);

  const loadNotifications = async (page = 0, reset = false) => {
    if (loading || (!reset && !hasMore)) return;
    
    if (!tokens?.accessToken) {
      console.log('⚠️ Token não disponível');
      return;
    }

    setLoading(true);
    console.log(`🔄 Carregando notificações - Página: ${page}, Reset: ${reset}`);

    try {
      const response = await fetch(
        `${apiAccountUrlV1}/notifications/search?pageNumber=${page}&pageSize=10`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: NotificationResponse = await response.json();
      const { content, hasNextPage, totalRecords } = data;

      console.log('✅ Notificações carregadas:', {
        quantidade: content.length,
        total: totalRecords,
        hasNextPage,
        primeiraNotificacao: content[0]
      });

      const sortedContent = content.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (reset) {
        setNotifications(sortedContent);
        setPageNumber(0);
      } else {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => n.id));
          const newItems = sortedContent.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newItems];
        });
      }

      setHasMore(hasNextPage && totalRecords > (page + 1) * 10);
      setPageNumber(page);
      
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('❌ Erro ao buscar notificações:', err);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    if (!tokens?.accessToken) return;
    
    setMarkingAsRead(id);
    console.log('📖 Marcando notificação como lida:', id);

    try {
      const response = await fetch(`${apiAccountUrlV1}/notifications/${id}/mark-as-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const serverReadAt = data?.readAt || new Date().toISOString();

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: serverReadAt } : n))
      );

      console.log('✅ Notificação marcada como lida');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ Erro ao marcar como lida:', err);
      Alert.alert('Erro', 'Não foi possível marcar como lida');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    if (!tokens?.accessToken) return;
    
    console.log('📖 Marcando todas como lidas');
    setLoading(true);

    try {
      const response = await fetch(`${apiAccountUrlV1}/notifications/mark-all-as-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      await loadNotifications(0, true);
      console.log('✅ Todas marcadas como lidas');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ Erro ao marcar todas como lidas:', err);
      Alert.alert('Erro', 'Não foi possível marcar todas como lidas');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: number) => {
    if (!tokens?.accessToken) return;
    
    console.log('🗑️ Excluindo notificação:', id);

    try {
      const response = await fetch(`${apiAccountUrlV1}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      console.log('✅ Notificação excluída');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('❌ Erro ao excluir:', err);
      Alert.alert('Erro', 'Não foi possível excluir a notificação');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, { icon: string; bg: string; color: string }> = {
      INFO: { icon: 'information', bg: '#dbeafe', color: '#1d4ed8' },
      SUCCESS: { icon: 'check-circle', bg: '#dcfce7', color: '#15803d' },
      WARNING: { icon: 'alert', bg: '#fef3c7', color: '#d97706' },
      ERROR: { icon: 'alert-circle', bg: '#fee2e2', color: '#dc2626' },
      MESSAGE: { icon: 'message', bg: '#e0e7ff', color: '#4f46e5' },
    };
    return icons[type] || icons.INFO;
  };

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Notificações</Text>
              {unreadCount > 0 && (
                <Text style={styles.unreadCount}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Lista de Notificações */}
          <ScrollView 
            style={styles.notificationList} 
            showsVerticalScrollIndicator={false}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
              if (isCloseToBottom && hasMore && !loading) {
                console.log('📜 Carregando próxima página:', pageNumber + 1);
                loadNotifications(pageNumber + 1, false);
              }
            }}
            scrollEventThrottle={400}
          >
            {loading && notifications.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4F6AF5" />
                <Text style={{ marginTop: 12, color: '#6b7280' }}>Carregando notificações...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <MaterialCommunityIcons name="bell-off-outline" size={64} color="#d1d5db" />
                <Text style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
                  Nenhuma notificação
                </Text>
              </View>
            ) : (
              <>
                {notifications.map((notification) => {
                  const iconConfig = getNotificationIcon(notification.type);
                  const isUnread = !notification.readAt;
                  const isMarking = markingAsRead === notification.id;

                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        isUnread && styles.notificationItemUnread
                      ]}
                      onPress={() => !isMarking && isUnread && markAsRead(notification.id)}
                      onLongPress={() => {
                        Alert.alert(
                          'Excluir Notificação',
                          'Deseja excluir esta notificação?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Excluir', style: 'destructive', onPress: () => deleteNotification(notification.id) }
                          ]
                        );
                      }}
                      activeOpacity={0.7}
                      disabled={isMarking}
                    >
                      <View style={[styles.notificationIcon, { backgroundColor: iconConfig.bg }]}>
                        {isMarking ? (
                          <ActivityIndicator size="small" color={iconConfig.color} />
                        ) : (
                          <MaterialCommunityIcons
                            name={iconConfig.icon as any}
                            size={24}
                            color={iconConfig.color}
                          />
                        )}
                      </View>
                      <View style={styles.notificationDetails}>
                        <View style={styles.notificationTitleRow}>
                          <Text style={styles.notificationTitle}>{notification.title}</Text>
                          {isUnread && <View style={styles.unreadDot} />}
                        </View>
                        <Text style={styles.notificationDescription} numberOfLines={2}>
                          {notification.description}
                        </Text>
                        <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {loading && notifications.length > 0 && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#4F6AF5" />
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Footer com ação */}
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllReadButton}
              onPress={markAllAsRead}
              activeOpacity={0.7}
              disabled={loading}
            >
              <MaterialCommunityIcons name="check-all" size={20} color="#4F6AF5" />
              <Text style={styles.markAllReadText}>Marcar todas como lidas</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default NotificationModal;