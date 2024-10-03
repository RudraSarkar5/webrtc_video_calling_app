import {  Socket } from "socket.io-client"; 
import { ReactNode } from "react";


export type SocketContextType = Socket | null;

export interface SocketProviderProps {
  children: ReactNode;
}

export interface JoinRoomPayload {
  from: string;
}

export interface AlreadyExistPayload {
  from: string;
}

export interface OfferPayload {
  from: string;
  offer: RTCSessionDescriptionInit; 
}

export interface AnswerPayload {
  answer: RTCSessionDescriptionInit; 
}




