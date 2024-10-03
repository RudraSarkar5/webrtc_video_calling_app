import React, { createContext, useContext, useEffect, useMemo,  } from "react"; 
import { io } from "socket.io-client"; 
import { 
    SocketContextType ,
    SocketProviderProps,
} from "../Type/type"




const SocketContext = createContext<SocketContextType>(null);


export const useSocket = (): SocketContextType => {
  return useContext(SocketContext); 
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

  const socket = useMemo(() => io("http://localhost:8000"), []);

  
  useEffect(() => {
    
    socket.on("connect",()=>{
      console.log("socked connected : ",socket.id);
      
    })
    
    return () => {
      console.log("now what happen");
      
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
