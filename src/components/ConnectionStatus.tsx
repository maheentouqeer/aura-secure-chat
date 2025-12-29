import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { ConnectionState } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  state: ConnectionState;
}

export function ConnectionStatus({ state }: ConnectionStatusProps) {
  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      text: "Disconnected",
      className: "text-muted-foreground",
    },
    connecting: {
      icon: Loader2,
      text: "Connecting...",
      className: "text-cyber-yellow animate-pulse",
    },
    connected: {
      icon: Wifi,
      text: "Secure Connection",
      className: "text-cyber-green text-glow-green",
    },
    error: {
      icon: WifiOff,
      text: state.error || "Connection Error",
      className: "text-cyber-red",
    },
  };

  const config = statusConfig[state.status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 font-mono text-sm", config.className)}>
      <Icon className={cn("h-4 w-4", state.status === "connecting" && "animate-spin")} />
      <span>{config.text}</span>
      {state.status === "connected" && (
        <span className="inline-block h-2 w-2 rounded-full bg-cyber-green animate-pulse-glow" />
      )}
    </div>
  );
}
