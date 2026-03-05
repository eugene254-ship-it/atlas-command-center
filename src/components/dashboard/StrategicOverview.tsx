import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const arrData = [
  { month: "Mar", value: 1.2 }, { month: "Apr", value: 1.5 }, { month: "May", value: 1.8 },
  { month: "Jun", value: 2.1 }, { month: "Jul", value: 2.4 }, { month: "Aug", value: 2.9 },
  { month: "Sep", value: 3.2 }, { month: "Oct", value: 3.8 }, { month: "Nov", value: 4.3 },
  { month: "Dec", value: 4.9 }, { month: "Jan", value: 5.6 }, { month: "Feb", value: 6.4 },
];

const retentionData = [
  { quarter: "Q1 '25", retention: 108, target: 100 },
  { quarter: "Q2 '25", retention: 112, target: 100 },
  { quarter: "Q3 '25", retention: 118, target: 100 },
  { quarter: "Q4 '25", retention: 124, target: 100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-surface rounded-md px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono text-foreground font-medium">${payload[0].value}M</p>
    </div>
  );
};

const StrategicOverview = () => (
  <DashboardSection title="Strategic Overview — North-Star Metrics" delay={0.1}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        label="Annual Recurring Revenue"
        value="$6.4M"
        change="+32.4%"
        trend="up"
        subtitle="12-month trailing"
        delay={0.15}
      >
        <div className="h-24 mt-2 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={arrData}>
              <defs>
                <linearGradient id="arrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide domain={["dataMin - 0.5", "dataMax + 0.5"]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(152, 58%, 48%)"
                strokeWidth={2}
                fill="url(#arrGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MetricCard>

      <MetricCard
        label="Net Revenue Growth Rate"
        value="28.7%"
        change="+4.2pp"
        trend="up"
        subtitle="Quarter-over-quarter"
        delay={0.2}
      >
        <div className="flex items-end gap-1.5 mt-2 h-16">
          {[18, 22, 21, 24, 26, 28, 25, 29].map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-primary/20"
              style={{ height: `${(v / 30) * 100}%` }}
            >
              <div
                className="w-full rounded-sm bg-primary/60"
                style={{ height: `${(v / 30) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </MetricCard>

      <MetricCard
        label="Net Revenue Retention"
        value="124%"
        change="+6pp"
        trend="up"
        subtitle="Expansion exceeds churn"
        delay={0.25}
      >
        <div className="space-y-2 mt-2">
          {retentionData.map((d) => (
            <div key={d.quarter} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{d.quarter}</span>
                <span className="font-mono text-foreground">{d.retention}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min((d.retention / 130) * 100, 100)}%` }}
                />
                <div
                  className="h-0.5 bg-accent/50 relative"
                  style={{ width: `${(d.target / 130) * 100}%`, marginTop: "-0.375rem" }}
                />
              </div>
            </div>
          ))}
        </div>
      </MetricCard>
    </div>
  </DashboardSection>
);

export default StrategicOverview;
