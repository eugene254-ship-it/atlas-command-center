import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import { motion } from "framer-motion";

const initiatives = [
  { name: "Regenerative Value Exchange", progress: 78, status: "On Track" },
  { name: "Global Metrics Engine", progress: 52, status: "In Progress" },
  { name: "Sovereign Data Layer", progress: 35, status: "Planning" },
  { name: "Institutional API Gateway", progress: 91, status: "Near Complete" },
];

const OrganizationalHealth = () => (
  <DashboardSection title="Organizational Health — Internal Signals" delay={0.9}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        label="Revenue per Employee"
        value="$142K"
        change="+18%"
        trend="up"
        subtitle="45 employees · $6.4M ARR"
        delay={0.95}
      >
        <div className="mt-2 flex items-end gap-1 h-12">
          {[95, 102, 108, 115, 120, 128, 135, 142].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="rounded-sm bg-chart-4/40"
                style={{ height: `${((v - 90) / 60) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </MetricCard>

      <MetricCard
        label="Engineering Capacity"
        value="72%"
        subtitle="New features vs maintenance"
        delay={1.0}
      >
        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">New Capabilities</span>
              <span className="font-mono text-foreground">72%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary/70" style={{ width: "72%" }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Maintenance</span>
              <span className="font-mono text-foreground">18%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-chart-2/60" style={{ width: "18%" }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tech Debt</span>
              <span className="font-mono text-foreground">10%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-destructive/50" style={{ width: "10%" }} />
            </div>
          </div>
        </div>
      </MetricCard>

      <div className="glass-surface rounded-lg p-5">
        <span className="metric-label">Strategic Initiative Progress</span>
        <div className="mt-4 space-y-4">
          {initiatives.map((init, i) => (
            <motion.div
              key={init.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.05 + i * 0.08 }}
              className="space-y-1.5"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground font-medium">{init.name}</span>
                <span className="font-mono text-muted-foreground">{init.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${init.progress}%` }}
                  transition={{ delay: 1.1 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                  style={{
                    backgroundColor:
                      init.progress > 80
                        ? "hsl(152, 58%, 48%)"
                        : init.progress > 50
                        ? "hsl(200, 70%, 55%)"
                        : "hsl(38, 92%, 55%)",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{init.status}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </DashboardSection>
);

export default OrganizationalHealth;
