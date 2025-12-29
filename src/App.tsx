import { useState } from "react";
import { ChatProvider, useChat } from "@/context/ChatContext";
import { useSecureSocket } from "@/hooks/useSecureSocket";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";

function ChatApp() {
  const { connectionState, clearAll } = useChat();
  const { connect, disconnect, sendMessage, isConnected } = useSecureSocket();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleJoin = (username: string) => {
    connect(username);
    setIsAuthenticated(true);
  };

  const handleDisconnect = () => {
    disconnect();
    clearAll();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthScreen onJoin={handleJoin} connectionState={connectionState} />;
  }

  return <Dashboard onSendMessage={sendMessage} onDisconnect={handleDisconnect} />;
}

export default function App() {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
}
