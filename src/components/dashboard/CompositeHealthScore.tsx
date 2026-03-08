import { motion } from "framer-motion";
import DashboardSection from "./DashboardSection";
import { useMetrics } from "@/hooks/useMetrics";
import { useMemo } from "react";

interface LayerScore {
  label: string;
  score: number;
  weight: number;
  color: string;
  section: string;
}

const LAYER_CONFIG = [
  { label: "Strategic Overview", section: "strategic_overview", weight: 0.25, color: "hsl(var(--primary))" },
  { label: "Market Expansion", section: "market_expansion", weight: 0.15, color: "hsl(var(--chart-3))" },
  { label: "Operational Velocity", section: "operational_velocity", weight: 0.20, color: "hsl(var(--chart-2))" },
  { label: "Ecosystem Growth", section: "ecosystem_growth", weight: 0.15, color: "hsl(var(--primary))" },
  { label: "Organizational Health", section: "organizational_health", weight: 0.15, color: "hsl(var(--chart-4))" },
  { label: "Strategic Forecast", section: "strategic_forecast", weight: 0.10, color: "hsl(var(--chart-3))" },
];

// Map sections to representative metric keys and how to score them (0-100)
const SECTION_SCORERS: Record<string, (metrics: Record<string, number>) => number> = {
  strategic_overview: (m) => {
    const arrScore = Math.min(100, (m["arr"] || 0) / 10 * 100); // 10M ARR = 100
    const nrrScore = Math.min(100, (m["nrr"] || 0) / 1.3 * 100 / 100); // 130% NRR = 100
    const churnScore = Math.max(0, 100 - (m["churn_rate"] || 5) * 20); // 0% = 100, 5% = 0
    const growthScore = Math.min(100, (m["net_revenue_growth"] || 0) / 40 * 100); // 40% = 100
    return Math.round((arrScore + nrrScore + churnScore + growthScore) / 4);
  },
  market_expansion: (m) => {
    const partners = Math.min(100, (m["regional_partners"] || 0) / 50 * 100);
    const adoption = Math.min(100, (m["sector_adoption"] || 0) / 40 * 100);
    return Math.round((partners + adoption) / 2);
  },
  operational_velocity: (m) => {
    const deploys = Math.min(100, (m["deployment_velocity"] || 0) / 15 * 100); // 15/day = 100
    const ttv = Math.max(0, 100 - (m["time_to_value"] || 30) * 3); // 0 days = 100
    const completion = Math.min(100, m["project_completion"] || 0);
    return Math.round((deploys + ttv + completion) / 3);
  },
  ecosystem_growth: (m) => {
    const partners = Math.min(100, (m["active_partners"] || 0) / 200 * 100);
    const regen = Math.min(100, (m["regenerative_assets"] || 0) / 100000 * 100);
    const volume = Math.min(100, (m["transaction_volume"] || 0) / 10 * 100);
    return Math.round((partners + regen + volume) / 3);
  },
  organizational_health: (m) => {
    const capacity = Math.min(100, (m["engineering_capacity"] || 0));
    const initiatives = Math.min(100, (m["initiative_progress"] || 0));
    const rpe = Math.min(100, (m["revenue_per_employee"] || 0) / 200 * 100);
    return Math.round((capacity + initiatives + rpe) / 3);
  },
  strategic_forecast: (m) => {
    // Derive forecast confidence from overall data quality
    const hasData = Object.keys(m).length;
    return Math.min(100, hasData > 0 ? 75 : 0); // Base score when data exists
  },
};

const getGrade = (score: number) => {
  if (score >= 90) return { grade: "A", label: "Exceptional", className: "text-primary" };
  if (score >= 80) return { grade: "B+", label: "Strong", className: "text-primary" };
  if (score >= 70) return { grade: "B", label: "On Track", className: "text-chart-3" };
  if (score >= 60) return { grade: "C", label: "Needs Attention", className: "text-accent" };
  return { grade: "D", label: "Critical", className: "text-destructive" };
};

const CompositeHealthScore = () => {
  const { data: allMetrics, isLoading } = useMetrics();

  const layers = useMemo<LayerScore[]>(() => {
    if (!allMetrics?.length) return LAYER_CONFIG.map((c) => ({ ...c, score: 0 }));

    return LAYER_CONFIG.map((config) => {
      const sectionMetrics = allMetrics.filter((m) => m.section === config.section);
      // Get latest value per metric_key
      const latest: Record<string, number> = {};
      for (const m of sectionMetrics) {
        if (!latest[m.metric_key]) latest[m.metric_key] = m.metric_value;
      }
      const scorer = SECTION_SCORERS[config.section];
      const score = scorer ? scorer(latest) : 0;
      return { ...config, score: Math.min(100, Math.max(0, score)) };
    });
  }, [allMetrics]);

  const compositeScore = Math.round(layers.reduce((sum, l) => sum + l.score * l.weight, 0));
  const { grade, label, className } = getGrade(compositeScore);

  const strongest = [...layers].sort((a, b) => b.score - a.score)[0];
  const weakest = [...layers].sort((a, b) => a.score - b.score)[0];

  if (isLoading) {
    return (
      <DashboardSection title="Executive Health Index — Composite Signal" delay={0.05}>
        <div className="glass-surface rounded-lg p-5 h-40 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardSection>
    );
  }

  return (
    <DashboardSection title="Executive Health Index — Composite Signal" delay={0.05}>
      <div className="glass-surface rounded-lg p-5">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Score display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-2 min-w-[120px]"
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - compositeScore / 100) }}
                  transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-semibold text-foreground">{compositeScore}</span>
                <span className={`text-xs font-semibold ${className}`}>{grade}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </motion.div>

          {/* Layer breakdown */}
          <div className="flex-1 w-full space-y-3">
            {layers.map((layer, i) => (
              <motion.div
                key={layer.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{layer.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{(layer.weight * 100).toFixed(0)}%w</span>
                    <span className="font-mono text-foreground font-medium w-8 text-right">{layer.score}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: layer.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${layer.score}%` }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key signals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-border/30">
          {[
            { label: "Strongest", value: strongest?.label.split(" ").pop() || "—", detail: `${strongest?.score || 0}/100` },
            { label: "Weakest", value: weakest?.label.split(" ").pop() || "—", detail: `${weakest?.score || 0}/100` },
            { label: "Composite", value: compositeScore >= 80 ? "Strong" : compositeScore >= 60 ? "Moderate" : "Weak", detail: `${compositeScore}/100` },
            { label: "Sections", value: `${layers.filter(l => l.score >= 70).length}/6`, detail: "above 70" },
          ].map((signal) => (
            <div key={signal.label} className="text-xs space-y-0.5">
              <span className="text-muted-foreground">{signal.label}</span>
              <div className="font-mono text-foreground font-medium">{signal.value}</div>
              <span className="text-[10px] text-muted-foreground">{signal.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardSection>
  );
};

export default CompositeHealthScore;
