import React, { createContext, useContext, useEffect, useMemo, ReactNode } from "react"; 
import { io, Socket } from "socket.io-client"; 


export type SocketContextType = Socket | null;


const SocketContext = createContext<SocketContextType>(null);


export const useSocket = (): SocketContextType => {
  return useContext(SocketContext); 
};


interface SocketProviderProps {
  children: ReactNode;
}


const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

  const socket = useMemo(() => io("http://localhost:8000"), []);

  
  useEffect(() => {
    return () => {
      socket.disconnect(); 
    };
  }, [socket]);

  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};


export default SocketProvider;
