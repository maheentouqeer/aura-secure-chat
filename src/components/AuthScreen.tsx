import { useState, KeyboardEvent } from "react";
import { Shield, Lock, User, ChevronRight } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import { ConnectionState } from "@/types/chat";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  onJoin: (username: string) => void;
  connectionState: ConnectionState;
}

export function AuthScreen({ onJoin, connectionState }: AuthScreenProps) {
  const [username, setUsername] = useState("");

  const handleJoin = () => {
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJoin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 cyber-grid">
      {/* Animated scan line */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-green to-transparent animate-scan-line" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 rounded-lg border-2 border-cyber-green glow-green bg-card">
            <Shield className="h-12 w-12 text-cyber-green" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-glow-green">
            <span className="text-cyber-green">Secure</span>{" "}
            <span className="text-foreground">Chat System</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            RSA + XOR Encryption • SHA-256 Integrity
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-cyber-cyan" />
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-md 
                         font-mono placeholder:text-muted-foreground
                         focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green
                         transition-all duration-200"
              />
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={!username.trim() || connectionState.status === "connecting"}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md",
              "font-semibold text-primary-foreground",
              "bg-primary hover:bg-primary/90 transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "group glow-green"
            )}
          >
            <Lock className="h-5 w-5" />
            <span>Join Secure Network</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Connection Status */}
          <div className="flex justify-center">
            <ConnectionStatus state={connectionState} />
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🔐", label: "RSA-2048" },
            { icon: "🔒", label: "XOR Cipher" },
            { icon: "✅", label: "SHA-256" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="p-3 bg-card/50 rounded-lg border border-border/50"
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-xs font-mono text-muted-foreground">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
