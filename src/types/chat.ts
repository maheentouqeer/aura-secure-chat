export interface User {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  from: string;
  text: string;
  timestamp: Date;
  verified: boolean;
  type: "msg" | "system" | "alert";
}

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: "rsa_exchange" | "xor_encrypt" | "hash_verify" | "hash_fail" | "connection" | "attack_detected";
  message: string;
  severity: "info" | "success" | "warning" | "error";
  details?: string;
}

export interface ConnectionState {
  status: "disconnected" | "connecting" | "connected" | "error";
  error?: string;
}

export type ChatPayload =
  | { type: "join"; name: string | null }
  | { type: "msg"; text: string }
  | { type: "leave" }
  | { type: "users"; users: string[] };
