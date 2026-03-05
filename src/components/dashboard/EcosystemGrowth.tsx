import { useState } from "react";
import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import DrillDownModal, { DrillDownTable, DrillDownStat } from "./DrillDownModal";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
        {payload[0].value >= 1000 ? `${(payload[0].value / 1000).toFixed(0)}K hectares` : `$${payload[0].value}M`}
      </p>
    </div>
  );
};

const EcosystemGrowth = () => {
  const [assetsModal, setAssetsModal] = useState(false);
  const [txModal, setTxModal] = useState(false);
  const [partnersModal, setPartnersModal] = useState(false);

  return (
    <>
      <DashboardSection title="Ecosystem Growth — Regenerative Impact" delay={0.7}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Regenerative Assets Verified" value="94K ha" change="+38%" trend="up" subtitle="Hectares restored & validated" delay={0.75} onClick={() => setAssetsModal(true)}>
            <div className="h-20 mt-2 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={assetData}>
                  <defs>
                    <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide /><YAxis hide />
                  <Tooltip content={<AssetTooltip />} />
                  <Area type="monotone" dataKey="hectares" stroke="hsl(152, 58%, 48%)" strokeWidth={1.5} fill="url(#assetGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </MetricCard>

          <MetricCard label="Transaction Volume (RVE)" value="$6.8M" change="+31%" trend="up" subtitle="Regenerative Value Exchange" delay={0.8} onClick={() => setTxModal(true)}>
            <div className="h-20 mt-2 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={txData}>
                  <defs>
                    <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide /><YAxis hide />
                  <Tooltip content={<AssetTooltip />} />
                  <Area type="monotone" dataKey="volume" stroke="hsl(38, 92%, 55%)" strokeWidth={1.5} fill="url(#txGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </MetricCard>

          <MetricCard label="Active Institutional Partners" value="161" change="+24" trend="up" subtitle="Governments, banks, NGOs, research" delay={0.85} onClick={() => setPartnersModal(true)}>
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

      <DrillDownModal open={assetsModal} onOpenChange={setAssetsModal} title="Regenerative Assets — Verification Details" subtitle="Breakdown by asset type and region">
        <div className="space-y-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<AssetTooltip />} />
                <Area type="monotone" dataKey="hectares" stroke="hsl(152, 58%, 48%)" strokeWidth={2} fill="url(#assetGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <DrillDownTable
            headers={["Asset Type", "Hectares", "% of Total", "Carbon (tCO₂e)", "Status"]}
            rows={[
              ["Reforestation", "38,200", "41%", "192K", "Verified"],
              ["Wetland Restoration", "22,400", "24%", "89K", "Verified"],
              ["Regenerative Ag", "18,600", "20%", "64K", "Verified"],
              ["Biodiversity Zones", "14,800", "15%", "42K", "In Review"],
            ]}
          />
        </div>
      </DrillDownModal>

      <DrillDownModal open={txModal} onOpenChange={setTxModal} title="Transaction Volume — Exchange Activity" subtitle="Regenerative Value Exchange trading breakdown">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Total Volume</span>
              <div className="font-mono text-xl text-foreground">$6.8M</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Avg Transaction</span>
              <div className="font-mono text-xl text-foreground">$42K</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Active Traders</span>
              <div className="font-mono text-xl text-foreground">89</div>
            </div>
          </div>
          <DrillDownTable
            headers={["Asset Class", "Volume", "Transactions", "Avg Price", "Trend"]}
            rows={[
              ["Carbon Credits", "$3.2M", "42", "$76K", "↑ +28%"],
              ["Biodiversity Offsets", "$1.8M", "28", "$64K", "↑ +45%"],
              ["Water Credits", "$1.1M", "38", "$29K", "↑ +22%"],
              ["Soil Health Tokens", "$0.7M", "54", "$13K", "→ +8%"],
            ]}
          />
        </div>
      </DrillDownModal>

      <DrillDownModal open={partnersModal} onOpenChange={setPartnersModal} title="Institutional Partners — Network Details" subtitle="Partner distribution by type and engagement level">
        <div className="space-y-6">
          <DrillDownTable
            headers={["Partner Type", "Active", "Pipeline", "Avg Contract", "Retention"]}
            rows={[
              ["Governments", "28", "12", "$185K", "96%"],
              ["Development Banks", "12", "5", "$420K", "100%"],
              ["NGOs", "64", "24", "$48K", "88%"],
              ["Research Institutions", "57", "18", "$62K", "92%"],
            ]}
          />
          <div>
            <span className="section-title">Recent Partner Additions</span>
            <div className="mt-3 space-y-0">
              <DrillDownStat label="Ministry of Environment, Colombia" value="$240K" change="Enterprise" />
              <DrillDownStat label="Green Climate Fund" value="$580K" change="Development Bank" />
              <DrillDownStat label="Max Planck Institute" value="$95K" change="Research" />
              <DrillDownStat label="Conservation International" value="$120K" change="NGO" />
            </div>
          </div>
        </div>
      </DrillDownModal>
    </>
  );
};

export default EcosystemGrowth;
