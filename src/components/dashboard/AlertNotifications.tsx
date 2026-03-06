import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, Info, AlertCircle, Check, X } from "lucide-react";
import { useAlertNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useAlerts";
import { formatDistanceToNow } from "date-fns";

const severityConfig = {
  info: { icon: Info, className: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/20" },
  warning: { icon: AlertTriangle, className: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  critical: { icon: AlertCircle, className: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

const AlertNotifications = () => {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useAlertNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-secondary/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-secondary transition-all font-medium print:hidden"
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Alerts</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse-glow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 glass-surface rounded-lg shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead.mutate()}
                      className="text-[10px] text-primary hover:text-primary/80 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                    No notifications yet. Alerts will appear when metrics cross configured thresholds.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const config = severityConfig[n.severity as keyof typeof severityConfig] || severityConfig.info;
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`px-4 py-3 border-b border-border/20 hover:bg-secondary/30 transition-colors ${
                          !n.is_read ? config.bg : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-0.5 ${config.className}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDistanceToNow(new Date(n.triggered_at), { addSuffix: true })}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {n.metric_key} = {n.metric_value}
                              </span>
                            </div>
                          </div>
                          {!n.is_read && (
                            <button
                              onClick={() => markAsRead.mutate(n.id)}
                              className="text-muted-foreground hover:text-primary transition-colors mt-0.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertNotifications;
