import { Server, Socket } from "socket.io";

export interface ServerToClientEvents {
    messageSent: (nickname: string, message: string) => void;
    userJoinedChatroom: (nickname: string) => void;
    userLeftChatroom: (nickname: string) => void;
}

export interface ClientToServerEvents {
    setNickname: (nickname: string, callback: (response: "success" | "unavailable") => void) => void;
    getAllChatrooms: (callback: (response: Chatroom[]) => void) => void;
    joinChatroom: (name: string, onSuccess: () => void) => void;
    sendMessage: (message: string, onSuccess: () => void) => void;
    getUsersInChatroom: (callback: (response: string[]) => void) => void;
}

export interface InterServerEvents { }

export interface SocketData {
    nickname: string;
}

export interface Chatroom {
    name: string;
    description: string;
}

export type ChatServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;