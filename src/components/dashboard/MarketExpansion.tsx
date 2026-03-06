import DashboardSection from "./DashboardSection";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const regions = [
  { name: "North America", partners: 42, projects: 128, contracts: 67, x: 22, y: 35 },
  { name: "Europe", partners: 38, projects: 96, contracts: 54, x: 52, y: 28 },
  { name: "South America", partners: 24, projects: 72, contracts: 31, x: 30, y: 62 },
  { name: "Africa", partners: 18, projects: 64, contracts: 22, x: 55, y: 55 },
  { name: "Asia Pacific", partners: 31, projects: 89, contracts: 43, x: 75, y: 40 },
  { name: "Oceania", partners: 8, projects: 21, contracts: 12, x: 82, y: 68 },
];

const sectorData = [
  { sector: "Climate Finance", orgs: 34 },
  { sector: "Government", orgs: 28 },
  { sector: "Research", orgs: 22 },
  { sector: "Enterprise", orgs: 19 },
  { sector: "Regen Agriculture", orgs: 16 },
  { sector: "Development Banks", orgs: 12 },
];

const SectorTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-surface rounded-md px-3 py-2 text-xs">
      <p className="text-muted-foreground">{payload[0].payload.sector}</p>
      <p className="font-mono text-foreground font-medium">{payload[0].value} organizations</p>
    </div>
  );
};

const MarketExpansion = () => (
  <DashboardSection title="Market Expansion — Global Penetration" delay={0.3}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Geographic Map */}
      <div className="glass-surface rounded-lg p-5">
        <span className="metric-label">Active Regions</span>
        <div className="relative mt-4 h-64 bg-secondary/30 rounded-md overflow-hidden">
          {/* Simplified world map using dots */}
          <svg viewBox="0 0 100 80" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            {[20, 40, 60].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(220, 14%, 18%)" strokeWidth="0.2" />
            ))}
            {[25, 50, 75].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="80" stroke="hsl(220, 14%, 18%)" strokeWidth="0.2" />
            ))}
            {regions.map((r, i) => (
              <g key={r.name}>
                <motion.circle
                  cx={r.x}
                  cy={r.y}
                  r={Math.max(r.partners / 8, 1.5)}
                  fill="hsl(152, 58%, 48%)"
                  opacity={0.6}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                />
                <motion.circle
                  cx={r.x}
                  cy={r.y}
                  r={Math.max(r.partners / 8, 1.5) + 2}
                  fill="none"
                  stroke="hsl(152, 58%, 48%)"
                  strokeWidth="0.3"
                  opacity={0.3}
                  className="animate-pulse-glow"
                />
                <text
                  x={r.x}
                  y={r.y - Math.max(r.partners / 8, 1.5) - 2}
                  textAnchor="middle"
                  fill="hsl(210, 20%, 75%)"
                  fontSize="2.5"
                  fontFamily="Inter, sans-serif"
                >
                  {r.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {regions.slice(0, 3).map((r) => (
            <div key={r.name} className="text-xs space-y-1">
              <span className="text-muted-foreground">{r.name}</span>
              <div className="font-mono text-foreground">{r.partners} partners</div>
              <div className="text-muted-foreground">{r.projects} projects</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Adoption */}
      <div className="glass-surface rounded-lg p-5">
        <span className="metric-label">Sector Adoption</span>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="sector"
                width={120}
                tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<SectorTooltip />} />
              <Bar
                dataKey="orgs"
                fill="hsl(152, 58%, 48%)"
                radius={[0, 4, 4, 0]}
                opacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </DashboardSection>
);

export default MarketExpansion;
