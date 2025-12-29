import { useEffect } from "react";
import { Brain, Sparkles, AlertTriangle } from "lucide-react";
import { SecurityEvent } from "@/types/chat";
import { useSecurityAI } from "@/hooks/useSecurityAI";
import { cn, formatTime } from "@/lib/utils";

interface AIInsightsProps {
  events: SecurityEvent[];
}

export function AIInsights({ events }: AIInsightsProps) {
  const { insights, analyzeEvent } = useSecurityAI();

  useEffect(() => {
    // Analyze new events
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      const alreadyAnalyzed = insights.some((i) => i.event.id === latestEvent.id);
      if (!alreadyAnalyzed) {
        analyzeEvent(latestEvent);
      }
    }
  }, [events, insights, analyzeEvent]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-cyber-cyan mb-4">
        <Brain className="h-5 w-5" />
        <span className="font-semibold">AI Security Analysis</span>
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>

      {insights.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">AI insights will appear here</p>
          <p className="text-xs mt-1">I'll explain security events in plain language</p>
        </div>
      ) : (
        insights.map((insight, index) => (
          <div
            key={insight.event.id}
            className={cn(
              "p-4 rounded-lg border animate-fade-in",
              insight.event.severity === "error"
                ? "bg-cyber-red/10 border-cyber-red/30"
                : insight.event.severity === "warning"
                ? "bg-cyber-yellow/10 border-cyber-yellow/30"
                : "bg-card border-border"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Event Type Badge */}
            <div className="flex items-center gap-2 mb-2">
              {insight.event.severity === "error" && (
                <AlertTriangle className="h-4 w-4 text-cyber-red" />
              )}
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-mono rounded uppercase",
                  insight.event.severity === "error"
                    ? "bg-cyber-red/20 text-cyber-red"
                    : insight.event.severity === "warning"
                    ? "bg-cyber-yellow/20 text-cyber-yellow"
                    : insight.event.severity === "success"
                    ? "bg-cyber-green/20 text-cyber-green"
                    : "bg-cyber-cyan/20 text-cyber-cyan"
                )}
              >
                {insight.event.type.replace("_", " ")}
              </span>
              <span className="text-xs text-muted-foreground font-mono ml-auto">
                {formatTime(insight.event.timestamp)}
              </span>
            </div>

            {/* AI Explanation */}
            <p className="text-sm leading-relaxed">{insight.explanation}</p>
          </div>
        ))
      )}
    </div>
  );
}
