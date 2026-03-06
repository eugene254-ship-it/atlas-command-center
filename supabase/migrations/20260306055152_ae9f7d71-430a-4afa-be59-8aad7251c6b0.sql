
-- Create table for dashboard metrics snapshots
CREATE TABLE public.dashboard_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT DEFAULT 'number',
  section TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for metric alerts/thresholds
CREATE TABLE public.metric_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('above', 'below', 'change_rate')),
  threshold_value NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  message TEXT,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for alert history/notifications
CREATE TABLE public.alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.metric_alerts(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  is_read BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for dashboard
CREATE POLICY "Anyone can read metrics" ON public.dashboard_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert metrics" ON public.dashboard_metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read alerts config" ON public.metric_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can manage alerts" ON public.metric_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update alerts" ON public.metric_alerts FOR UPDATE USING (true);

CREATE POLICY "Anyone can read notifications" ON public.alert_notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications" ON public.alert_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON public.alert_notifications FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_metrics_key_date ON public.dashboard_metrics (metric_key, recorded_at DESC);
CREATE INDEX idx_metrics_section ON public.dashboard_metrics (section);
CREATE INDEX idx_alerts_active ON public.metric_alerts (is_active) WHERE is_active = true;
CREATE INDEX idx_notifications_unread ON public.alert_notifications (is_read) WHERE is_read = false;
