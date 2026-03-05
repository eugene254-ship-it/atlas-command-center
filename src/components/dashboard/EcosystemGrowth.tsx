import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const assetData = [
  { month: "Jun", hectares: 12000 }, { month: "Jul", hectares: 18000 },
  { month: "Aug", hectares: 24000 }, { month: "Sep", hectares: 31000 },
  { month: "Oct", hectares: 42000 }, { month: "Nov", hectares: 56000 },
  { month: "Dec", hectares: 68000 }, { month: "Jan", hectares: 82000 },
  { month: "Feb", hectares: 94000 },
];

const txData = [
  { month: "Jun", volume: 0.4 }, { month: "Jul", volume: 0.8 },
  { month: "Aug", volume: 1.2 }, { month: "Sep", volume: 1.8 },
  { month: "Oct", volume: 2.6 }, { month: "Nov", volume: 3.4 },
  { month: "Dec", volume: 4.1 }, { month: "Jan", volume: 5.2 },
  { month: "Feb", volume: 6.8 },
];

const AssetTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-surface rounded-md px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono text-foreground font-medium">
        {payload[0].value >= 1000
          ? `${(payload[0].value / 1000).toFixed(0)}K hectares`
          : `$${payload[0].value}M`}
      </p>
    </div>
  );
};

const EcosystemGrowth = () => (
  <DashboardSection title="Ecosystem Growth — Regenerative Impact" delay={0.7}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        label="Regenerative Assets Verified"
        value="94K ha"
        change="+38%"
        trend="up"
        subtitle="Hectares restored & validated"
        delay={0.75}
      >
        <div className="h-20 mt-2 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={assetData}>
              <defs>
                <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip content={<AssetTooltip />} />
              <Area type="monotone" dataKey="hectares" stroke="hsl(152, 58%, 48%)" strokeWidth={1.5} fill="url(#assetGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MetricCard>

      <MetricCard
        label="Transaction Volume (RVE)"
        value="$6.8M"
        change="+31%"
        trend="up"
        subtitle="Regenerative Value Exchange"
        delay={0.8}
      >
        <div className="h-20 mt-2 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={txData}>
              <defs>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip content={<AssetTooltip />} />
              <Area type="monotone" dataKey="volume" stroke="hsl(38, 92%, 55%)" strokeWidth={1.5} fill="url(#txGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </MetricCard>

      <MetricCard
        label="Active Institutional Partners"
        value="161"
        change="+24"
        trend="up"
        subtitle="Governments, banks, NGOs, research"
        delay={0.85}
      >
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { type: "Governments", count: 28 },
            { type: "Dev Banks", count: 12 },
            { type: "NGOs", count: 64 },
            { type: "Research", count: 57 },
          ].map((p) => (
            <div key={p.type} className="text-xs space-y-0.5">
              <span className="text-muted-foreground">{p.type}</span>
              <div className="font-mono text-foreground">{p.count}</div>
            </div>
          ))}
        </div>
      </MetricCard>
    </div>
  </DashboardSection>
);

export default EcosystemGrowth;
