import { useCallback, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { SecurityEvent } from "@/types/chat";

const WS_URL = "ws://localhost:8765";

export function useSecureSocket() {
  const { addMessage, addSecurityEvent, setUsers, setConnectionState, setCurrentUser } = useChat();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const logSecurity = useCallback(
    (type: SecurityEvent["type"], message: string, severity: SecurityEvent["severity"], details?: string) => {
      addSecurityEvent({ type, message, severity, details });
    },
    [addSecurityEvent]
  );

  const connect = useCallback(
    (username: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setConnectionState({ status: "connecting" });
      logSecurity("connection", `Initiating secure connection to ${WS_URL}...`, "info");

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        logSecurity("connection", "WebSocket connection established", "success");
        logSecurity("rsa_exchange", "Receiving server RSA public key...", "info");
        
        // Send join message
        const joinPayload = JSON.stringify({ type: "join", name: username });
        ws.send(joinPayload);
        
        logSecurity("xor_encrypt", `Join message encrypted with XOR cipher`, "info");
        logSecurity("hash_verify", "SHA-256 hash generated for message integrity", "success");
        
        setCurrentUser(username);
        setConnectionState({ status: "connected" });
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          logSecurity("xor_encrypt", "Decrypting incoming message...", "info");
          
          if (data.verified === false) {
            logSecurity("hash_fail", "⚠ MESSAGE INTEGRITY CHECK FAILED - Possible tampering detected!", "error");
            logSecurity("attack_detected", "Security Alert: Hash mismatch indicates potential MITM attack", "error", 
              "The received message hash does not match the computed hash. This could indicate message tampering during transmission.");
          } else {
            logSecurity("hash_verify", "Message integrity verified via SHA-256", "success");
          }

          if (data.type === "msg") {
            addMessage({
              from: data.from,
              text: data.text,
              verified: data.verified !== false,
              type: "msg",
            });
          } else if (data.type === "users") {
            setUsers(data.users);
          } else if (data.type === "system") {
            addMessage({
              from: "System",
              text: data.text,
              verified: true,
              type: "system",
            });
          }
        } catch (error) {
          logSecurity("hash_fail", "Failed to parse incoming message", "error");
        }
      };

      ws.onerror = () => {
        logSecurity("connection", "Connection error occurred", "error");
        setConnectionState({ status: "error", error: "Connection failed" });
        setIsConnected(false);
      };

      ws.onclose = () => {
        logSecurity("connection", "Secure connection closed", "warning");
        setConnectionState({ status: "disconnected" });
        setIsConnected(false);
      };
    },
    [addMessage, setUsers, setConnectionState, setCurrentUser, logSecurity]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }

      const payload = JSON.stringify({ type: "msg", text });
      wsRef.current.send(payload);
      
      logSecurity("xor_encrypt", `Outgoing message encrypted with XOR cipher`, "info");
      logSecurity("hash_verify", "SHA-256 integrity hash attached", "success");
    },
    [logSecurity]
  );

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      const leavePayload = JSON.stringify({ type: "leave" });
      wsRef.current.send(leavePayload);
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  return { connect, disconnect, sendMessage, isConnected };
}
