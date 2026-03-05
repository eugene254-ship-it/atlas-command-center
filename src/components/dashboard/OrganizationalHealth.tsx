import { useState } from "react";
import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import DrillDownModal, { DrillDownTable, DrillDownStat } from "./DrillDownModal";
import { motion } from "framer-motion";

const initiatives = [
  { name: "Regenerative Value Exchange", progress: 78, status: "On Track" },
  { name: "Global Metrics Engine", progress: 52, status: "In Progress" },
  { name: "Sovereign Data Layer", progress: 35, status: "Planning" },
  { name: "Institutional API Gateway", progress: 91, status: "Near Complete" },
];

const OrganizationalHealth = () => {
  const [revenueModal, setRevenueModal] = useState(false);
  const [capacityModal, setCapacityModal] = useState(false);
  const [initiativesModal, setInitiativesModal] = useState(false);

  return (
    <>
      <DashboardSection title="Organizational Health — Internal Signals" delay={0.9}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Revenue per Employee" value="$142K" change="+18%" trend="up" subtitle="45 employees · $6.4M ARR" delay={0.95} onClick={() => setRevenueModal(true)}>
            <div className="mt-2 flex items-end gap-1 h-12">
              {[95, 102, 108, 115, 120, 128, 135, 142].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div className="rounded-sm bg-chart-4/40" style={{ height: `${((v - 90) / 60) * 100}%` }} />
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard label="Engineering Capacity" value="72%" subtitle="New features vs maintenance" delay={1.0} onClick={() => setCapacityModal(true)}>
            <div className="mt-3 space-y-3">
              {[
                { label: "New Capabilities", pct: "72%", width: "72%", color: "bg-primary/70" },
                { label: "Maintenance", pct: "18%", width: "18%", color: "bg-chart-2/60" },
                { label: "Tech Debt", pct: "10%", width: "10%", color: "bg-destructive/50" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-mono text-foreground">{item.pct}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
          </MetricCard>

          <div className="glass-surface rounded-lg p-5 cursor-pointer hover:border-primary/30 transition-colors group relative" onClick={() => setInitiativesModal(true)}>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </div>
            <span className="metric-label">Strategic Initiative Progress</span>
            <div className="mt-4 space-y-4">
              {initiatives.map((init, i) => (
                <motion.div key={init.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.05 + i * 0.08 }} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-medium">{init.name}</span>
                    <span className="font-mono text-muted-foreground">{init.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${init.progress}%` }} transition={{ delay: 1.1 + i * 0.08, duration: 0.8, ease: "easeOut" }} style={{ backgroundColor: init.progress > 80 ? "hsl(152, 58%, 48%)" : init.progress > 50 ? "hsl(200, 70%, 55%)" : "hsl(38, 92%, 55%)" }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{init.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DashboardSection>

      <DrillDownModal open={revenueModal} onOpenChange={setRevenueModal} title="Revenue per Employee — Efficiency Analysis" subtitle="Organizational leverage and team growth">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1"><span className="text-xs text-muted-foreground">Employees</span><div className="font-mono text-xl text-foreground">45</div></div>
            <div className="space-y-1"><span className="text-xs text-muted-foreground">Rev/Employee</span><div className="font-mono text-xl text-foreground">$142K</div></div>
            <div className="space-y-1"><span className="text-xs text-muted-foreground">Target</span><div className="font-mono text-xl text-primary">$180K</div></div>
          </div>
          <DrillDownTable
            headers={["Department", "Headcount", "Revenue Attribution", "Rev/Head", "Change"]}
            rows={[
              ["Engineering", "18", "$2.1M", "$117K", "+12%"],
              ["Sales", "8", "$2.8M", "$350K", "+22%"],
              ["Product", "6", "$0.8M", "$133K", "+15%"],
              ["Operations", "7", "$0.5M", "$71K", "+8%"],
              ["Leadership", "6", "$0.2M", "$33K", "—"],
            ]}
          />
        </div>
      </DrillDownModal>

      <DrillDownModal open={capacityModal} onOpenChange={setCapacityModal} title="Engineering Capacity — Allocation Breakdown" subtitle="How the engineering team spends its effort">
        <div className="space-y-6">
          <DrillDownTable
            headers={["Category", "Sprint Points", "% Capacity", "Team", "Trend"]}
            rows={[
              ["Core Platform", "142", "32%", "Platform Team", "→ Stable"],
              ["Client Features", "118", "27%", "Product Team", "↑ Growing"],
              ["RVE Development", "58", "13%", "Fintech Team", "↑ Growing"],
              ["Maintenance", "78", "18%", "All Teams", "↓ Shrinking"],
              ["Tech Debt", "44", "10%", "Platform Team", "↓ Shrinking"],
            ]}
          />
          <div>
            <span className="section-title">Key Metrics</span>
            <div className="mt-3 space-y-0">
              <DrillDownStat label="Cycle time (avg)" value="4.2 days" change="-0.8d" positive />
              <DrillDownStat label="PR merge rate" value="94%" change="+3pp" positive />
              <DrillDownStat label="Incident rate" value="0.3/week" change="-40%" positive />
              <DrillDownStat label="Test coverage" value="87%" change="+5pp" positive />
            </div>
          </div>
        </div>
      </DrillDownModal>

      <DrillDownModal open={initiativesModal} onOpenChange={setInitiativesModal} title="Strategic Initiatives — Milestone Tracking" subtitle="Long-term strategic projects and key milestones">
        <div className="space-y-6">
          {initiatives.map((init) => (
            <div key={init.name} className="glass-surface rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{init.name}</span>
                <span className="text-xs font-mono text-muted-foreground">{init.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${init.progress}%`,
                  backgroundColor: init.progress > 80 ? "hsl(152, 58%, 48%)" : init.progress > 50 ? "hsl(200, 70%, 55%)" : "hsl(38, 92%, 55%)",
                }} />
              </div>
              <div className="text-xs text-muted-foreground">
                Status: {init.status} · {init.progress > 80 ? "Expected completion: Q1 2026" : init.progress > 50 ? "Expected completion: Q2 2026" : "Expected completion: Q3 2026"}
              </div>
            </div>
          ))}
        </div>
      </DrillDownModal>
    </>
  );
};

export default OrganizationalHealth;
