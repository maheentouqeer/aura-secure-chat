import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Message, SecurityEvent, User, ConnectionState } from "@/types/chat";
import { generateId } from "@/lib/utils";

interface ChatContextType {
  messages: Message[];
  users: User[];
  securityEvents: SecurityEvent[];
  connectionState: ConnectionState;
  currentUser: string | null;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  addSecurityEvent: (event: Omit<SecurityEvent, "id" | "timestamp">) => void;
  setUsers: (users: string[]) => void;
  setConnectionState: (state: ConnectionState) => void;
  setCurrentUser: (name: string) => void;
  clearAll: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsersState] = useState<User[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>({ status: "disconnected" });
  const [currentUser, setCurrentUserState] = useState<string | null>(null);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: generateId(), timestamp: new Date() },
    ]);
  }, []);

  const addSecurityEvent = useCallback((event: Omit<SecurityEvent, "id" | "timestamp">) => {
    setSecurityEvents((prev) => [
      ...prev,
      { ...event, id: generateId(), timestamp: new Date() },
    ]);
  }, []);

  const setUsers = useCallback((userNames: string[]) => {
    setUsersState(
      userNames.map((name) => ({
        id: generateId(),
        name,
        joinedAt: new Date(),
      }))
    );
  }, []);

  const setCurrentUser = useCallback((name: string) => {
    setCurrentUserState(name);
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
    setSecurityEvents([]);
    setUsersState([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        securityEvents,
        connectionState,
        currentUser,
        addMessage,
        addSecurityEvent,
        setUsers,
        setConnectionState,
        setCurrentUser,
        clearAll,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
