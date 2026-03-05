import DashboardSection from "./DashboardSection";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

type Scenario = "base" | "growth" | "conservative";

const scenarios: Record<Scenario, { label: string; data: { year: string; revenue: number; ecosystem: number; users: number }[] }> = {
  base: {
    label: "Base Case",
    data: [
      { year: "2025", revenue: 6.4, ecosystem: 94, users: 161 },
      { year: "2026", revenue: 12.8, ecosystem: 220, users: 340 },
      { year: "2027", revenue: 24.5, ecosystem: 480, users: 680 },
      { year: "2028", revenue: 42.0, ecosystem: 920, users: 1200 },
    ],
  },
  growth: {
    label: "Accelerated Growth",
    data: [
      { year: "2025", revenue: 6.4, ecosystem: 94, users: 161 },
      { year: "2026", revenue: 18.2, ecosystem: 310, users: 480 },
      { year: "2027", revenue: 38.0, ecosystem: 720, users: 1100 },
      { year: "2028", revenue: 72.0, ecosystem: 1500, users: 2400 },
    ],
  },
  conservative: {
    label: "Conservative",
    data: [
      { year: "2025", revenue: 6.4, ecosystem: 94, users: 161 },
      { year: "2026", revenue: 9.6, ecosystem: 150, users: 240 },
      { year: "2027", revenue: 15.0, ecosystem: 280, users: 400 },
      { year: "2028", revenue: 22.0, ecosystem: 450, users: 620 },
    ],
  },
};

const ForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-surface rounded-md px-3 py-2 text-xs space-y-1">
      <p className="text-muted-foreground font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span className="text-muted-foreground capitalize">{p.dataKey}</span>
          <span className="font-mono text-foreground">
            {p.dataKey === "revenue" ? `$${p.value}M` : p.dataKey === "ecosystem" ? `${p.value}K ha` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const StrategicForecast = () => {
  const [activeScenario, setActiveScenario] = useState<Scenario>("base");
  const scenario = scenarios[activeScenario];

  return (
    <DashboardSection title="Strategic Forecast — Scenario Modeling" delay={1.2}>
      <div className="glass-surface rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-medium text-foreground">3-Year Projection</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue, ecosystem, and platform growth under different assumptions</p>
          </div>
          <div className="flex gap-1.5">
            {(Object.keys(scenarios) as Scenario[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveScenario(key)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all font-medium ${
                  activeScenario === key
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
                }`}
              >
                {scenarios[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Forecast */}
          <div>
            <span className="metric-label">Revenue Projection</span>
            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scenario.data}>
                  <defs>
                    <linearGradient id="forecastRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(152, 58%, 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                  <Tooltip content={<ForecastTooltip />} />
                  <ReferenceLine y={6.4} stroke="hsl(220, 14%, 25%)" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(152, 58%, 48%)" strokeWidth={2} fill="url(#forecastRevGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <span className="font-mono text-lg text-foreground">${scenario.data[3].revenue}M</span>
              <span className="text-xs text-muted-foreground ml-2">by 2028</span>
            </div>
          </div>

          {/* Ecosystem Forecast */}
          <div>
            <span className="metric-label">Ecosystem Scale</span>
            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scenario.data}>
                  <defs>
                    <linearGradient id="forecastEcoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}K`} />
                  <Tooltip content={<ForecastTooltip />} />
                  <Area type="monotone" dataKey="ecosystem" stroke="hsl(38, 92%, 55%)" strokeWidth={2} fill="url(#forecastEcoGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <span className="font-mono text-lg text-foreground">{scenario.data[3].ecosystem}K ha</span>
              <span className="text-xs text-muted-foreground ml-2">verified by 2028</span>
            </div>
          </div>

          {/* Partners Forecast */}
          <div>
            <span className="metric-label">Platform Adoption</span>
            <div className="h-48 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scenario.data}>
                  <defs>
                    <linearGradient id="forecastUserGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(200, 70%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ForecastTooltip />} />
                  <Area type="monotone" dataKey="users" stroke="hsl(200, 70%, 55%)" strokeWidth={2} fill="url(#forecastUserGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <span className="font-mono text-lg text-foreground">{scenario.data[3].users}</span>
              <span className="text-xs text-muted-foreground ml-2">partners by 2028</span>
            </div>
          </div>
        </div>

        {/* Scenario Summary */}
        <motion.div
          key={activeScenario}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-md bg-secondary/50 border border-border/50"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-muted-foreground">Revenue CAGR</span>
              <div className="font-mono text-sm text-foreground mt-1">
                {activeScenario === "growth" ? "125%" : activeScenario === "base" ? "87%" : "51%"}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Ecosystem Growth</span>
              <div className="font-mono text-sm text-foreground mt-1">
                {activeScenario === "growth" ? "16x" : activeScenario === "base" ? "9.8x" : "4.8x"}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Partner Expansion</span>
              <div className="font-mono text-sm text-foreground mt-1">
                {activeScenario === "growth" ? "15x" : activeScenario === "base" ? "7.5x" : "3.9x"}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardSection>
  );
};

export default StrategicForecast;
