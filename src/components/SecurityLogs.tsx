import { Key, Lock, ShieldCheck, ShieldAlert, Wifi, AlertTriangle } from "lucide-react";
import { SecurityEvent } from "@/types/chat";
import { cn, formatTime } from "@/lib/utils";

interface SecurityLogsProps {
  events: SecurityEvent[];
}

const eventIcons: Record<SecurityEvent["type"], typeof Key> = {
  rsa_exchange: Key,
  xor_encrypt: Lock,
  hash_verify: ShieldCheck,
  hash_fail: ShieldAlert,
  connection: Wifi,
  attack_detected: AlertTriangle,
};

const severityColors: Record<SecurityEvent["severity"], string> = {
  info: "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10",
  success: "text-cyber-green border-cyber-green/30 bg-cyber-green/10",
  warning: "text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/10",
  error: "text-cyber-red border-cyber-red/30 bg-cyber-red/10",
};

export function SecurityLogs({ events }: SecurityLogsProps) {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-2 font-mono text-sm">
      {events.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No security events yet</p>
          <p className="text-xs mt-1">Events will appear here when you connect</p>
        </div>
      ) : (
        [...events].reverse().map((event, index) => {
          const Icon = eventIcons[event.type];
          return (
            <div
              key={event.id}
              className={cn(
                "p-3 rounded-md border animate-fade-in",
                severityColors[event.severity],
                event.severity === "error" && "animate-pulse-red"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start gap-2">
                <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                    <span>{formatTime(event.timestamp)}</span>
                    <span className="uppercase">[{event.type.replace("_", " ")}]</span>
                  </div>
                  <p className="break-words">{event.message}</p>
                  {event.details && (
                    <p className="mt-1 text-xs opacity-70 break-words">{event.details}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
