import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const deploymentData = [
  { week: "W1", releases: 3 }, { week: "W2", releases: 5 }, { week: "W3", releases: 4 },
  { week: "W4", releases: 7 }, { week: "W5", releases: 6 }, { week: "W6", releases: 8 },
  { week: "W7", releases: 7 }, { week: "W8", releases: 9 }, { week: "W9", releases: 11 },
  { week: "W10", releases: 8 }, { week: "W11", releases: 12 }, { week: "W12", releases: 10 },
];

const VelocityTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-surface rounded-md px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono text-foreground font-medium">{payload[0].value} releases</p>
    </div>
  );
};

const OperationalVelocity = () => (
  <DashboardSection title="Operational Velocity — Execution Engine" delay={0.5}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        label="Deployment Velocity"
        value="10.2"
        change="+18%"
        trend="up"
        subtitle="Releases per week (avg)"
        delay={0.55}
      >
        <div className="h-20 mt-2 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={deploymentData}>
              <XAxis dataKey="week" hide />
              <YAxis hide domain={[0, 14]} />
              <Tooltip content={<VelocityTooltip />} />
              <Line
                type="monotone"
                dataKey="releases"
                stroke="hsl(200, 70%, 55%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </MetricCard>

      <MetricCard
        label="Project Completion Rate"
        value="87%"
        change="+5pp"
        trend="up"
        subtitle="On-schedule delivery"
        delay={0.6}
      >
        <div className="mt-3 space-y-2">
          {[
            { label: "Completed", count: 47, total: 54 },
            { label: "In Progress", count: 12, total: 54 },
            { label: "Delayed", count: 4, total: 54 },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono text-foreground">{item.count}</span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(item.count / item.total) * 100}%`,
                    backgroundColor:
                      item.label === "Delayed"
                        ? "hsl(0, 72%, 55%)"
                        : item.label === "In Progress"
                        ? "hsl(38, 92%, 55%)"
                        : "hsl(152, 58%, 48%)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </MetricCard>

      <MetricCard
        label="Avg Time to Customer Value"
        value="14 days"
        change="-3 days"
        trend="up"
        subtitle="From onboarding to first outcome"
        delay={0.65}
      >
        <div className="mt-3 flex items-end gap-1 h-16">
          {[28, 24, 22, 19, 18, 16, 15, 14].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className="rounded-sm bg-chart-3/40"
                style={{ height: `${(v / 30) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Q1 '24</span>
          <span>Now</span>
        </div>
      </MetricCard>
    </div>
  </DashboardSection>
);

export default OperationalVelocity;
