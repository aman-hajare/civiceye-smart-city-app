import React, { createContext, useEffect, useState, useCallback, useContext, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import { getAccessToken } from '../services/auth';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationVersion, setNotificationVersion] = useState(0);
  const [authToken, setAuthToken] = useState(() => getAccessToken());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  const refreshNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getAll();
      setNotifications(list);
      setUnreadCount(list.filter((item) => !item.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      const socket = wsRef.current;
      wsRef.current = null;
      socket.onclose = null;
      socket.close();
    }
    setIsConnected(false);
  }, []);

  const connectWebSocket = useCallback((token) => {
    if (!token) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://127.0.0.1:8000/ws/notifications/?token=${token}`;
      const websocket = new WebSocket(wsUrl);
      wsRef.current = websocket;

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        refreshNotifications();
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          let isNewNotification = true;
          setNotifications((prev) => {
            if (prev.some((notification) => notification.id === data.id)) {
              isNewNotification = false;
              return prev;
            }
            return [{ ...data, is_read: false }, ...prev];
          });
          if (isNewNotification) {
            setUnreadCount((prev) => prev + 1);
            setNotificationVersion((prev) => prev + 1);
          }
        } catch (e) {
          console.error('Error parsing notification:', e);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      websocket.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        wsRef.current = null;
        if (shouldReconnectRef.current && getAccessToken()) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket(getAccessToken());
          }, 2000);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    const syncAuthState = () => {
      setAuthToken(getAccessToken());
    };

    const handleStorage = (event) => {
      if (!event || event.key === 'access' || event.key === 'refresh') {
        syncAuthState();
      }
    };

    window.addEventListener('auth:changed', syncAuthState);
    window.addEventListener('storage', handleStorage);
    syncAuthState();

    return () => {
      window.removeEventListener('auth:changed', syncAuthState);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    disconnectWebSocket();

    if (!authToken) {
      setNotifications([]);
      setUnreadCount(0);
      return () => {
        shouldReconnectRef.current = false;
      };
    }

    refreshNotifications();
    connectWebSocket(authToken);

    return () => {
      shouldReconnectRef.current = false;
      disconnectWebSocket();
    };
  }, [authToken, connectWebSocket, disconnectWebSocket, refreshNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    let hasUnreadTransition = false;

    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? (() => {
              if (!notif.is_read) {
                hasUnreadTransition = true;
              }
              return { ...notif, is_read: true };
            })()
          : notif
      )
    );

    if (hasUnreadTransition) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }

    setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
    setUnreadCount(0);
  }, []);

  const value = {
    notifications,
    unreadCount,
    isConnected,
    notificationVersion,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
