import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketContextType } from '../types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (token && user) {
      const newSocket = io('http://localhost:3001', {
        auth: {
          token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      setSocket(null);
      setIsConnected(false);
    }
  }, [token, user]);

  const joinGroup = (groupId: number) => {
    if (socket) {
      socket.emit('join_group', { group_id: groupId });
    }
  };

  const leaveGroup = (groupId: number) => {
    if (socket) {
      socket.emit('leave_group', { group_id: groupId });
    }
  };

  const sendDirectMessage = (recipientId: number, content: string) => {
    if (socket) {
      socket.emit('send_direct_message', { recipient_id: recipientId, content });
    }
  };

  const sendGroupMessage = (groupId: number, content: string) => {
    if (socket) {
      socket.emit('send_group_message', { group_id: groupId, content });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinGroup,
    leaveGroup,
    sendDirectMessage,
    sendGroupMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};