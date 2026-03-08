
-- KPI targets table for goal tracking
CREATE TABLE public.kpi_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL,
  target_value numeric NOT NULL,
  target_label text,
  target_deadline timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(metric_key, is_active)
);

ALTER TABLE public.kpi_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage kpi targets" ON public.kpi_targets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can read kpi targets" ON public.kpi_targets
  FOR SELECT TO authenticated
  USING (true);

-- Enable realtime (skip admin_notifications already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_metrics;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.kpi_targets;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
