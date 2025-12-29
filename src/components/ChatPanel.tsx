import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, MessageSquare, ShieldCheck } from "lucide-react";
import { Message } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  messages: Message[];
  currentUser: string | null;
  onSendMessage: (text: string) => void;
}

export function ChatPanel({ messages, currentUser, onSendMessage }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyber-green" />
          <h2 className="font-semibold">Encrypted Chat</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <ShieldCheck className="h-4 w-4 text-cyber-green" />
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 cyber-grid">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground space-y-2">
              <MessageSquare className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start a secure conversation</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.from === currentUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your encrypted message..."
            className="flex-1 px-4 py-3 bg-secondary border border-border rounded-md 
                     font-mono text-sm placeholder:text-muted-foreground
                     focus:outline-none focus:border-cyber-green focus:ring-1 focus:ring-cyber-green
                     transition-all duration-200"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "px-4 py-3 rounded-md flex items-center gap-2",
              "bg-primary text-primary-foreground font-semibold",
              "hover:bg-primary/90 transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              input.trim() && "glow-green"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
