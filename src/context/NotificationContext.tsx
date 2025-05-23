import React, { createContext, useContext, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationStore } from '@/components/store/useNotificationStore';

export interface NotificationMessage {
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    // Dacă user-ul nu este autentificat sau nu are companie, nu ne conectăm
    if (!user || !user.companyId) return;
  
    const socket = new SockJS(`${import.meta.env.VITE_API_URL}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/company/${user.companyId}`, (message) => {
          const notification: NotificationMessage = JSON.parse(message.body);
      
          // Salvăm notificarea în store global
          useNotificationStore.getState().addNotification(notification);
      
          // Afișăm toast
          toast({
            title: notification.title,
            description: notification.message,
          });
        });
      }
      
    });
  
    stompClient.activate();
    stompClientRef.current = stompClient;
  
    return () => {
      stompClient.deactivate();
    };
  }, [user?.companyId]); // se activează doar dacă e autentificat
  

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
