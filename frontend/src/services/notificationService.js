import api from './api';

const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications/');
    return normalizeList(response.data);
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread_count/');
      return Number(response.data?.unread_count || 0);
    } catch {
      return 0;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.post(`/notifications/${id}/mark_read/`);
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        const response = await api.patch(`/notifications/${id}/`, { is_read: true });
        return response.data;
      }
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/mark_all_read/');
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        const notifications = await notificationService.getAll();
        await Promise.all(notifications.filter(n => !n.is_read).map(n => notificationService.markAsRead(n.id)));
        return { success: true };
      }
      throw error;
    }
  },
};

export const getNotifications = async () => notificationService.getAll();
export const getUnreadCount = async () => notificationService.getUnreadCount();
export const markNotificationAsRead = async (id) => notificationService.markAsRead(id);
