import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MetricRow {
  id: string;
  metric_key: string;
  metric_value: number;
  metric_unit: string | null;
  section: string;
  recorded_at: string;
  metadata: Record<string, unknown> | null;
}

export const useMetrics = (section?: string) => {
  return useQuery({
    queryKey: ["dashboard-metrics", section],
    queryFn: async () => {
      let query = supabase
        .from("dashboard_metrics")
        .select("*")
        .order("recorded_at", { ascending: false });

      if (section) {
        query = query.eq("section", section);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MetricRow[];
    },
    refetchInterval: 30000, // Refresh every 30s for live feel
  });
};

export const useLatestMetric = (metricKey: string) => {
  return useQuery({
    queryKey: ["latest-metric", metricKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_metrics")
        .select("*")
        .eq("metric_key", metricKey)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as MetricRow | null;
    },
    refetchInterval: 30000,
  });
};
