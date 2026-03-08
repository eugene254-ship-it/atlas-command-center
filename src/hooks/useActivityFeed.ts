import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityEntry {
  id: string;
  action: string;
  admin_user_id: string;
  target_email: string | null;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export const useActivityFeed = (limit = 20) => {
  return useQuery({
    queryKey: ["activity-feed", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ActivityEntry[];
    },
    refetchInterval: 30000,
  });
};
