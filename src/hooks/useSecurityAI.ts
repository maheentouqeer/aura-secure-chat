import { useState, useCallback } from "react";
import { SecurityEvent } from "@/types/chat";

// Rule-based AI explanations for security events
const explanations: Record<SecurityEvent["type"], (event: SecurityEvent) => string> = {
  rsa_exchange: () => 
    "🔐 RSA Key Exchange: The server is sharing its public key with you. This allows your messages to be encrypted so only the server can read them. Think of it like sharing a locked mailbox - anyone can drop mail in, but only you have the key to open it.",
  
  xor_encrypt: (event) => 
    event.message.includes("Outgoing") 
      ? "🔒 Your message is being scrambled using XOR encryption before sending. This turns your readable text into a secret code that looks like random characters."
      : "🔓 An incoming message is being unscrambled. The same XOR key used to encrypt is now decrypting the message back to readable text.",
  
  hash_verify: (event) => 
    event.message.includes("integrity") 
      ? "✅ Message Verified: The SHA-256 hash confirms this message hasn't been tampered with during transmission. It's like a digital fingerprint that proves the message is exactly what was sent."
      : "📝 A SHA-256 hash (like a digital fingerprint) has been created for your message. This will help the receiver verify the message wasn't modified.",
  
  hash_fail: () => 
    "⚠️ SECURITY ALERT: The message's digital fingerprint doesn't match! This means someone may have intercepted and modified the message while it was being sent. This is a classic sign of a Man-in-the-Middle attack.",
  
  connection: (event) => 
    event.severity === "success" 
      ? "🌐 You're now securely connected to the chat server. All communications will be encrypted and verified."
      : event.severity === "error"
      ? "❌ Connection failed. The server might be offline or there could be network issues. Check that the WebSocket bridge is running."
      : "📡 Establishing encrypted channel to the chat server...",
  
  attack_detected: () => 
    "🚨 ATTACK DETECTED: The system has identified a potential security breach. A Man-in-the-Middle attacker may be intercepting communications. Messages marked as 'Tampered' should not be trusted. The attacker could be reading or modifying your messages.",
};

export function useSecurityAI() {
  const [insights, setInsights] = useState<Array<{ event: SecurityEvent; explanation: string }>>([]);

  const analyzeEvent = useCallback((event: SecurityEvent) => {
    const explanation = explanations[event.type]?.(event) || "Processing security event...";
    
    setInsights((prev) => [
      { event, explanation },
      ...prev.slice(0, 49), // Keep last 50 insights
    ]);
    
    return explanation;
  }, []);

  const classifyRisk = useCallback((verified: boolean, from: string): "normal" | "suspicious" | "dangerous" => {
    if (!verified) return "dangerous";
    if (from.toLowerCase().includes("admin") || from.toLowerCase().includes("system")) {
      return "normal";
    }
    return "normal";
  }, []);

  return { insights, analyzeEvent, classifyRisk };
}
