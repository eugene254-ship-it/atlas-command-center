-- Tighten RLS policies to require authenticated users

-- dashboard_metrics: read-only for authenticated users
DROP POLICY IF EXISTS "Anyone can read metrics" ON public.dashboard_metrics;
DROP POLICY IF EXISTS "Anyone can insert metrics" ON public.dashboard_metrics;
CREATE POLICY "Authenticated users can read metrics" ON public.dashboard_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert metrics" ON public.dashboard_metrics FOR INSERT TO service_role WITH CHECK (true);

-- alert_notifications: authenticated read/update, service role insert
DROP POLICY IF EXISTS "Anyone can read notifications" ON public.alert_notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.alert_notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON public.alert_notifications;
CREATE POLICY "Authenticated users can read notifications" ON public.alert_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can update notifications" ON public.alert_notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Service role can insert notifications" ON public.alert_notifications FOR INSERT TO service_role WITH CHECK (true);

-- metric_alerts: authenticated read, service role write
DROP POLICY IF EXISTS "Anyone can read alerts config" ON public.metric_alerts;
DROP POLICY IF EXISTS "Anyone can manage alerts" ON public.metric_alerts;
DROP POLICY IF EXISTS "Anyone can update alerts" ON public.metric_alerts;
CREATE POLICY "Authenticated users can read alerts" ON public.metric_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can insert alerts" ON public.metric_alerts FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role can update alerts" ON public.metric_alerts FOR UPDATE TO service_role USING (true);