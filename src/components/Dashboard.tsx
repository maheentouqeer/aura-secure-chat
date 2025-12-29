import { useState } from "react";
import { Shield, FileText, Brain, LogOut } from "lucide-react";
import { UserPanel } from "./UserPanel";
import { ChatPanel } from "./ChatPanel";
import { SecurityLogs } from "./SecurityLogs";
import { AIInsights } from "./AIInsights";
import { ConnectionStatus } from "./ConnectionStatus";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";

interface DashboardProps {
  onSendMessage: (text: string) => void;
  onDisconnect: () => void;
}

type SecurityTab = "logs" | "ai";

export function Dashboard({ onSendMessage, onDisconnect }: DashboardProps) {
  const { messages, users, securityEvents, connectionState, currentUser } = useChat();
  const [activeTab, setActiveTab] = useState<SecurityTab>("logs");

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 border border-primary/30">
            <Shield className="h-5 w-5 text-cyber-green" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-glow-green">
              <span className="text-cyber-green">Secure</span> Chat
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {currentUser && `Logged in as ${currentUser}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectionStatus state={connectionState} />
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md
                     text-sm text-muted-foreground hover:text-cyber-red
                     hover:bg-cyber-red/10 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Users */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <UserPanel users={users} currentUser={currentUser} />
        </div>

        {/* Center Panel - Chat */}
        <div className="flex-1 border-x border-border min-w-0">
          <ChatPanel
            messages={messages}
            currentUser={currentUser}
            onSendMessage={onSendMessage}
          />
        </div>

        {/* Right Panel - Security & AI */}
        <div className="w-96 flex-shrink-0 hidden xl:flex flex-col bg-card">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("logs")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all",
                activeTab === "logs"
                  ? "text-cyber-green border-b-2 border-cyber-green bg-cyber-green/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <FileText className="h-4 w-4" />
              Security Logs
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all",
                activeTab === "ai"
                  ? "text-cyber-cyan border-b-2 border-cyber-cyan bg-cyber-cyan/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Brain className="h-4 w-4" />
              AI Insights
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "logs" ? (
              <SecurityLogs events={securityEvents} />
            ) : (
              <AIInsights events={securityEvents} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
