
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { getToken } from '../services/authService';
import { SOCKET_SERVER_URL, SOCKET_PATH } from '../constants';
import { SignalingMessage } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitMessage: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.error("SocketProvider: No auth token found.");
      return;
    }

    const newSocket = io(SOCKET_SERVER_URL, {
      path: SOCKET_PATH,
      auth: { token },
      transports: ['websocket'] 
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
    
    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection.');
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, []); // Reconnect if token changes, though typically token is stable after login

  const emitMessage = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.error('Socket not connected or not available for emitting message.');
    }
  };
  
  return (
    <SocketContext.Provider value={{ socket, isConnected, emitMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
    