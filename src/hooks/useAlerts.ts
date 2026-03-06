import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AlertNotification {
  id: string;
  alert_id: string | null;
  metric_key: string;
  metric_value: number;
  threshold_value: number;
  message: string;
  severity: string;
  is_read: boolean;
  triggered_at: string;
}

export interface MetricAlert {
  id: string;
  metric_key: string;
  alert_type: string;
  threshold_value: number;
  is_active: boolean;
  message: string | null;
  severity: string;
}

export const useAlertNotifications = () => {
  return useQuery({
    queryKey: ["alert-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alert_notifications")
        .select("*")
        .order("triggered_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data ?? []) as AlertNotification[];
    },
    refetchInterval: 15000,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["unread-alert-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("alert_notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);

      if (error) throw error;
      return count ?? 0;
    },
    refetchInterval: 15000,
  });
};

export const useMetricAlerts = () => {
  return useQuery({
    queryKey: ["metric-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metric_alerts")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return (data ?? []) as MetricAlert[];
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("alert_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-alert-count"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("alert_notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-alert-count"] });
    },
  });
};
