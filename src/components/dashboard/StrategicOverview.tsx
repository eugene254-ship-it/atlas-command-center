import { useState } from "react";
import MetricCard from "./MetricCard";
import DashboardSection from "./DashboardSection";
import DrillDownModal, { DrillDownTable, DrillDownStat } from "./DrillDownModal";
import { useDateRange } from "./DateRangePicker";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const arrDataFull = [
  { month: "Mar '25", value: 1.2, newBiz: 0.3, expansion: 0.1, churn: -0.05 },
  { month: "Apr '25", value: 1.5, newBiz: 0.4, expansion: 0.12, churn: -0.04 },
  { month: "May '25", value: 1.8, newBiz: 0.35, expansion: 0.15, churn: -0.06 },
  { month: "Jun '25", value: 2.1, newBiz: 0.42, expansion: 0.18, churn: -0.05 },
  { month: "Jul '25", value: 2.4, newBiz: 0.38, expansion: 0.22, churn: -0.07 },
  { month: "Aug '25", value: 2.9, newBiz: 0.55, expansion: 0.28, churn: -0.06 },
  { month: "Sep '25", value: 3.2, newBiz: 0.48, expansion: 0.3, churn: -0.08 },
  { month: "Oct '25", value: 3.8, newBiz: 0.62, expansion: 0.35, churn: -0.09 },
  { month: "Nov '25", value: 4.3, newBiz: 0.58, expansion: 0.38, churn: -0.07 },
  { month: "Dec '25", value: 4.9, newBiz: 0.65, expansion: 0.42, churn: -0.1 },
  { month: "Jan '26", value: 5.6, newBiz: 0.72, expansion: 0.48, churn: -0.08 },
  { month: "Feb '26", value: 6.4, newBiz: 0.85, expansion: 0.55, churn: -0.09 },
];

const retentionData = [
  { quarter: "Q1 '25", retention: 108, target: 100 },
  { quarter: "Q2 '25", retention: 112, target: 100 },
  { quarter: "Q3 '25", retention: 118, target: 100 },
  { quarter: "Q4 '25", retention: 124, target: 100 },
];

const getFilteredData = (range: string) => {
  const sliceMap: Record<string, number> = { "7d": 1, "30d": 3, "90d": 6, "12m": 12, "all": 12 };
  return arrDataFull.slice(-(sliceMap[range] || 12));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-surface rounded-md px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono text-foreground font-medium">${payload[0].value}M</p>
    </div>
  );
};

const StrategicOverview = () => {
  const [arrModal, setArrModal] = useState(false);
  const [growthModal, setGrowthModal] = useState(false);
  const [retentionModal, setRetentionModal] = useState(false);
  const { range } = useDateRange();
  const arrData = getFilteredData(range);

  return (
    <>
      <DashboardSection title="Strategic Overview — North-Star Metrics" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Annual Recurring Revenue"
            value={`$${arrData[arrData.length - 1].value}M`}
            change="+32.4%"
            trend="up"
            subtitle="12-month trailing"
            delay={0.15}
            onClick={() => setArrModal(true)}
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
                  <Area type="monotone" dataKey="value" stroke="hsl(152, 58%, 48%)" strokeWidth={2} fill="url(#arrGradient)" />
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
            onClick={() => setGrowthModal(true)}
          >
            <div className="flex items-end gap-1.5 mt-2 h-16">
              {[18, 22, 21, 24, 26, 28, 25, 29].map((v, i) => (
                <div key={i} className="flex-1 rounded-sm bg-primary/20" style={{ height: `${(v / 30) * 100}%` }}>
                  <div className="w-full rounded-sm bg-primary/60" style={{ height: `${(v / 30) * 100}%` }} />
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
            onClick={() => setRetentionModal(true)}
          >
            <div className="space-y-2 mt-2">
              {retentionData.map((d) => (
                <div key={d.quarter} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{d.quarter}</span>
                    <span className="font-mono text-foreground">{d.retention}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((d.retention / 130) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </MetricCard>
        </div>
      </DashboardSection>

      {/* ARR Drill-Down */}
      <DrillDownModal open={arrModal} onOpenChange={setArrModal} title="Annual Recurring Revenue — Detailed Breakdown" subtitle="Revenue composition and growth drivers">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Current ARR</span>
              <div className="font-mono text-xl text-foreground">$6.4M</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">MRR</span>
              <div className="font-mono text-xl text-foreground">$533K</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">ARPU</span>
              <div className="font-mono text-xl text-foreground">$3,312</div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={arrDataFull}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="hsl(152, 58%, 48%)" strokeWidth={2} fill="url(#arrGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <DrillDownTable
            headers={["Month", "ARR", "New Business", "Expansion", "Churn"]}
            rows={arrDataFull.map((d) => [d.month, `$${d.value}M`, `$${d.newBiz}M`, `$${d.expansion}M`, `$${d.churn}M`])}
          />
        </div>
      </DrillDownModal>

      {/* Growth Rate Drill-Down */}
      <DrillDownModal open={growthModal} onOpenChange={setGrowthModal} title="Net Revenue Growth Rate — Trend Analysis" subtitle="Quarter-over-quarter growth trajectory">
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { q: "Q1 '25", rate: "18.4%", rev: "$1.8M" },
              { q: "Q2 '25", rate: "22.1%", rev: "$2.9M" },
              { q: "Q3 '25", rate: "25.6%", rev: "$3.8M" },
              { q: "Q4 '25", rate: "28.7%", rev: "$6.4M" },
            ].map((q) => (
              <div key={q.q} className="glass-surface rounded-md p-3 space-y-1">
                <span className="text-xs text-muted-foreground">{q.q}</span>
                <div className="font-mono text-lg text-foreground">{q.rate}</div>
                <div className="text-xs text-muted-foreground">{q.rev} revenue</div>
              </div>
            ))}
          </div>
          <div>
            <span className="section-title">Growth Drivers</span>
            <div className="mt-3 space-y-0">
              <DrillDownStat label="New customer acquisition" value="42%" change="+8pp" positive />
              <DrillDownStat label="Existing customer expansion" value="35%" change="+12pp" positive />
              <DrillDownStat label="Price increases" value="15%" change="+2pp" positive />
              <DrillDownStat label="Product upsells" value="8%" change="+3pp" positive />
            </div>
          </div>
          <div>
            <span className="section-title">Growth by Segment</span>
            <DrillDownTable
              headers={["Segment", "Growth Rate", "Revenue Share", "Trend"]}
              rows={[
                ["Enterprise", "34.2%", "45%", "↑ Accelerating"],
                ["Mid-Market", "28.1%", "30%", "→ Stable"],
                ["Government", "22.8%", "15%", "↑ Accelerating"],
                ["Research", "18.4%", "10%", "→ Stable"],
              ]}
            />
          </div>
        </div>
      </DrillDownModal>

      {/* Retention Drill-Down */}
      <DrillDownModal open={retentionModal} onOpenChange={setRetentionModal} title="Net Revenue Retention — Cohort Analysis" subtitle="Expansion revenue vs churn by customer cohort">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Gross Retention</span>
              <div className="font-mono text-xl text-foreground">94%</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Expansion Revenue</span>
              <div className="font-mono text-xl text-primary">+30%</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Logo Churn</span>
              <div className="font-mono text-xl text-destructive">3.2%</div>
            </div>
          </div>
          <DrillDownTable
            headers={["Cohort", "Start ARR", "Current ARR", "NRR", "Status"]}
            rows={[
              ["Q1 '25", "$420K", "$520K", "124%", "Expanding"],
              ["Q2 '25", "$680K", "$810K", "119%", "Expanding"],
              ["Q3 '25", "$940K", "$1.08M", "115%", "Healthy"],
              ["Q4 '25", "$1.2M", "$1.32M", "110%", "New"],
            ]}
          />
          <div>
            <span className="section-title">Churn Reasons (Last 90 Days)</span>
            <div className="mt-3 space-y-0">
              <DrillDownStat label="Budget constraints" value="4 accounts" change="$82K lost" positive={false} />
              <DrillDownStat label="Competitor switch" value="1 account" change="$24K lost" positive={false} />
              <DrillDownStat label="Project completed" value="2 accounts" change="$38K lost" positive={false} />
            </div>
          </div>
        </div>
      </DrillDownModal>
    </>
  );
};

export default StrategicOverview;
