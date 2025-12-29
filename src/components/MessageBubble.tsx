import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { Message } from "@/types/chat";
import { cn, formatTime } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isSystem = message.type === "system";
  
  if (isSystem) {
    return (
      <div className="flex justify-center my-2 animate-fade-in">
        <div className="px-4 py-1.5 bg-secondary/50 rounded-full text-sm text-muted-foreground font-mono">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-2 mb-3 animate-fade-in",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-md flex items-center justify-center font-bold text-sm",
          isOwn
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground border border-border"
        )}
      >
        {message.from.charAt(0).toUpperCase()}
      </div>

      {/* Message Content */}
      <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
        {/* Sender Name */}
        {!isOwn && (
          <span className="text-xs font-medium text-cyber-cyan">{message.from}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-4 py-2 rounded-lg relative",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : message.verified
              ? "bg-secondary text-foreground border border-border rounded-tl-none"
              : "bg-cyber-red/20 text-foreground border border-cyber-red rounded-tl-none animate-pulse-red"
          )}
        >
          <p className="text-sm break-words">{message.text}</p>
        </div>

        {/* Footer: Time + Verification */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isOwn && "justify-end"
          )}
        >
          <Clock className="h-3 w-3" />
          <span className="font-mono">{formatTime(message.timestamp)}</span>
          
          {message.verified ? (
            <div className="flex items-center gap-1 text-cyber-green">
              <ShieldCheck className="h-3 w-3" />
              <span>Verified</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-cyber-red">
              <ShieldAlert className="h-3 w-3" />
              <span>Tampered</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
