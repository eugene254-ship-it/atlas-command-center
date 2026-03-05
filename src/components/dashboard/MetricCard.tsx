import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
  subtitle?: string;
  children?: ReactNode;
  delay?: number;
}

const MetricCard = ({ label, value, change, trend = "flat", subtitle, children, delay = 0 }: MetricCardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendClass = trend === "up" ? "trend-up" : trend === "down" ? "trend-down" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-surface rounded-lg p-5 flex flex-col gap-3"
    >
      <span className="metric-label">{label}</span>
      <div className="flex items-end gap-3">
        <span className="metric-value text-foreground">{value}</span>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendClass} pb-1`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{change}</span>
          </div>
        )}
      </div>
      {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      {children}
    </motion.div>
  );
};

export default MetricCard;
