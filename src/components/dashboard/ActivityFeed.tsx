import { motion } from "framer-motion";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import DashboardSection from "./DashboardSection";
import { Clock, UserPlus, Shield, AlertTriangle, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const actionIcons: Record<string, typeof Activity> = {
  role_change: Shield,
  invite_user: UserPlus,
  suspend_user: AlertTriangle,
};

const ActivityFeed = () => {
  const { data: activities, isLoading } = useActivityFeed(15);

  if (isLoading) {
    return (
      <DashboardSection title="Activity Feed — Live Audit Log" delay={0.1}>
        <div className="glass-surface rounded-lg p-5 h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Activity Feed — Live Audit Log" delay={0.1}>
      <div className="glass-surface rounded-lg p-4 max-h-[400px] overflow-y-auto">
        {!activities?.length ? (
          <div className="text-center py-8">
            <Activity className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((entry, i) => {
              const Icon = actionIcons[entry.action] || Activity;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 py-3 border-b border-border/20 last:border-0"
                >
                  <div className="w-7 h-7 rounded-md bg-secondary/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground capitalize">
                        {entry.action.replace(/_/g, " ")}
                      </span>
                      {entry.target_email && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                          → {entry.target_email}
                        </span>
                      )}
                    </div>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {JSON.stringify(entry.details).slice(0, 80)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardSection>
  );
};

export default ActivityFeed;
