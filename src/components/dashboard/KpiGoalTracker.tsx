import { motion } from "framer-motion";
import { useState } from "react";
import DashboardSection from "./DashboardSection";
import { useKpiTargets, useUpsertKpiTarget } from "@/hooks/useKpiTargets";
import { useMetrics } from "@/hooks/useMetrics";
import { useUserRole } from "@/hooks/useUserRole";
import { Target, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";

const KPI_METRICS = [
  { key: "arr", label: "Annual Recurring Revenue", unit: "$M", format: (v: number) => `$${v.toFixed(1)}M` },
  { key: "nrr", label: "Net Revenue Retention", unit: "%", format: (v: number) => `${v.toFixed(0)}%` },
  { key: "churn_rate", label: "Churn Rate", unit: "%", format: (v: number) => `${v.toFixed(1)}%` },
  { key: "deployment_velocity", label: "Deployment Velocity", unit: "/day", format: (v: number) => `${v.toFixed(0)}/day` },
  { key: "active_partners", label: "Active Partners", unit: "", format: (v: number) => v.toFixed(0) },
  { key: "transaction_volume", label: "Transaction Volume", unit: "$M", format: (v: number) => `$${v.toFixed(1)}M` },
];

const KpiGoalTracker = () => {
  const { data: targets } = useKpiTargets();
  const { data: allMetrics } = useMetrics();
  const { isAdmin } = useUserRole();
  const upsertTarget = useUpsertKpiTarget();
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newTarget, setNewTarget] = useState("");

  // Get latest value for each metric
  const latestValues: Record<string, number> = {};
  if (allMetrics) {
    for (const m of allMetrics) {
      if (!latestValues[m.metric_key]) latestValues[m.metric_key] = m.metric_value;
    }
  }

  const handleSave = async (metricKey: string) => {
    const val = parseFloat(newTarget);
    if (isNaN(val)) {
      toast.error("Enter a valid number");
      return;
    }
    try {
      await upsertTarget.mutateAsync({ metric_key: metricKey, target_value: val });
      toast.success("Target set");
      setAddingFor(null);
      setNewTarget("");
    } catch {
      toast.error("Failed to set target");
    }
  };

  return (
    <DashboardSection title="KPI Goal Tracker — Targets & Progress" delay={0.1}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_METRICS.map((kpi, i) => {
          const target = targets?.find((t) => t.metric_key === kpi.key);
          const current = latestValues[kpi.key];
          const progress = target && current != null
            ? Math.min(100, Math.max(0, (current / target.target_value) * 100))
            : null;
          const isAdding = addingFor === kpi.key;

          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              className="glass-surface rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{kpi.label}</span>
                <Target className="w-3.5 h-3.5 text-muted-foreground" />
              </div>

              <div className="flex items-end gap-2">
                <span className="metric-value text-foreground text-lg">
                  {current != null ? kpi.format(current) : "—"}
                </span>
                {target && (
                  <span className="text-[10px] text-muted-foreground pb-0.5">
                    / {kpi.format(target.target_value)} target
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {progress != null && (
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        progress >= 100 ? "bg-primary" : progress >= 70 ? "bg-chart-3" : progress >= 40 ? "bg-accent" : "bg-destructive"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className={progress >= 100 ? "text-primary" : "text-muted-foreground"}>
                      {progress.toFixed(0)}% achieved
                    </span>
                    {progress >= 100 && (
                      <span className="text-primary font-medium">✓ Target met</span>
                    )}
                  </div>
                </div>
              )}

              {/* Set target (admin only) */}
              {isAdmin && !target && !isAdding && (
                <button
                  onClick={() => { setAddingFor(kpi.key); setNewTarget(""); }}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="w-3 h-3" /> Set target
                </button>
              )}

              {isAdmin && isAdding && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder={`Target ${kpi.unit}`}
                    className="flex-1 px-2 py-1 text-xs bg-secondary/50 border border-border/50 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSave(kpi.key)}
                    className="p-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setAddingFor(null)}
                    className="p-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {isAdmin && target && (
                <button
                  onClick={() => { setAddingFor(kpi.key); setNewTarget(String(target.target_value)); }}
                  className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Update target
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </DashboardSection>
  );
};

export default KpiGoalTracker;
