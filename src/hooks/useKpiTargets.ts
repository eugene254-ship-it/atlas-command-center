import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KpiTarget {
  id: string;
  metric_key: string;
  target_value: number;
  target_label: string | null;
  target_deadline: string | null;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export const useKpiTargets = () => {
  return useQuery({
    queryKey: ["kpi-targets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kpi_targets")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as KpiTarget[];
    },
  });
};

export const useUpsertKpiTarget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (target: { metric_key: string; target_value: number; target_label?: string; target_deadline?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deactivate existing target for this metric
      await supabase
        .from("kpi_targets")
        .update({ is_active: false } as any)
        .eq("metric_key", target.metric_key)
        .eq("is_active", true);

      const { error } = await supabase.from("kpi_targets").insert({
        metric_key: target.metric_key,
        target_value: target.target_value,
        target_label: target.target_label || null,
        target_deadline: target.target_deadline || null,
        created_by: user.id,
        is_active: true,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kpi-targets"] }),
  });
};
