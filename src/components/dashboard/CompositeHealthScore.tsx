import { motion } from "framer-motion";
import DashboardSection from "./DashboardSection";

interface LayerScore {
  label: string;
  score: number;
  weight: number;
  color: string;
}

const layers: LayerScore[] = [
  { label: "Strategic Overview", score: 88, weight: 0.25, color: "hsl(var(--primary))" },
  { label: "Market Expansion", score: 82, weight: 0.15, color: "hsl(var(--chart-3))" },
  { label: "Operational Velocity", score: 91, weight: 0.20, color: "hsl(var(--chart-2))" },
  { label: "Ecosystem Growth", score: 85, weight: 0.15, color: "hsl(var(--primary))" },
  { label: "Organizational Health", score: 78, weight: 0.15, color: "hsl(var(--chart-4))" },
  { label: "Strategic Forecast", score: 76, weight: 0.10, color: "hsl(var(--chart-3))" },
];

const compositeScore = Math.round(
  layers.reduce((sum, l) => sum + l.score * l.weight, 0)
);

const getGrade = (score: number) => {
  if (score >= 90) return { grade: "A", label: "Exceptional", className: "text-primary" };
  if (score >= 80) return { grade: "B+", label: "Strong", className: "text-primary" };
  if (score >= 70) return { grade: "B", label: "On Track", className: "text-chart-3" };
  if (score >= 60) return { grade: "C", label: "Needs Attention", className: "text-accent" };
  return { grade: "D", label: "Critical", className: "text-destructive" };
};

const CompositeHealthScore = () => {
  const { grade, label, className } = getGrade(compositeScore);

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
            { label: "Strongest", value: "Ops Velocity", detail: "91/100" },
            { label: "Weakest", value: "Forecast", detail: "76/100" },
            { label: "Trend", value: "Improving", detail: "+3 pts/mo" },
            { label: "Risk Level", value: "Low", detail: "1 watch item" },
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
