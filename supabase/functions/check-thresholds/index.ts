import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Fetch all active alert rules
    const { data: alerts, error: alertsErr } = await supabase
      .from("metric_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsErr) throw alertsErr;
    if (!alerts?.length) {
      return new Response(JSON.stringify({ message: "No active alerts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { metric_key: string; triggered: boolean; value?: number }[] = [];

    for (const alert of alerts) {
      // 2. Get latest metric value for this key
      const { data: metric } = await supabase
        .from("dashboard_metrics")
        .select("metric_value")
        .eq("metric_key", alert.metric_key)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!metric) {
        results.push({ metric_key: alert.metric_key, triggered: false });
        continue;
      }

      const value = Number(metric.metric_value);
      const threshold = Number(alert.threshold_value);
      let breached = false;

      if (alert.alert_type === "above" && value > threshold) breached = true;
      if (alert.alert_type === "below" && value < threshold) breached = true;

      if (breached) {
        // 3. Check if we already fired this alert in the last hour (avoid spam)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: recent } = await supabase
          .from("alert_notifications")
          .select("id")
          .eq("alert_id", alert.id)
          .gte("triggered_at", oneHourAgo)
          .limit(1);

        if (recent && recent.length > 0) {
          results.push({ metric_key: alert.metric_key, triggered: false, value });
          continue;
        }

        // 4. Create notification
        const direction = alert.alert_type === "above" ? "exceeded" : "dropped below";
        const message =
          alert.message || `${alert.metric_key} ${direction} threshold of ${threshold}`;

        await supabase.from("alert_notifications").insert({
          alert_id: alert.id,
          metric_key: alert.metric_key,
          metric_value: value,
          threshold_value: threshold,
          message,
          severity: alert.severity,
        });

        // 5. Update last_triggered_at
        await supabase
          .from("metric_alerts")
          .update({ last_triggered_at: new Date().toISOString() })
          .eq("id", alert.id);

        results.push({ metric_key: alert.metric_key, triggered: true, value });
      } else {
        results.push({ metric_key: alert.metric_key, triggered: false, value });
      }
    }

    return new Response(
      JSON.stringify({ checked: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
