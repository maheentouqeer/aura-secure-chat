import { Users, Circle } from "lucide-react";
import { User } from "@/types/chat";
import { cn } from "@/lib/utils";

interface UserPanelProps {
  users: User[];
  currentUser: string | null;
}

export function UserPanel({ users, currentUser }: UserPanelProps) {
  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyber-cyan" />
          <h2 className="font-semibold">Online Users</h2>
          <span className="ml-auto px-2 py-0.5 bg-cyber-green/20 text-cyber-green text-xs font-mono rounded-full">
            {users.length}
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {users.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No users online
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md transition-all duration-200 animate-slide-in-right",
                user.name === currentUser
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "h-9 w-9 rounded-md flex items-center justify-center font-bold text-sm",
                  user.name === currentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary border border-border"
                )}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{user.name}</span>
                  {user.name === currentUser && (
                    <span className="text-xs text-muted-foreground">(you)</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-cyber-green">
                  <Circle className="h-2 w-2 fill-current" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
