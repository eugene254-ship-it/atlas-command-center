import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime changes on dashboard_metrics, admin_notifications,
 * admin_activity_log, and kpi_targets — and invalidates relevant React Query caches.
 */
export const useRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("command-center-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dashboard_metrics" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
          queryClient.invalidateQueries({ queryKey: ["latest-metric"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notifications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_activity_log" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["activity-feed"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kpi_targets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["kpi-targets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
