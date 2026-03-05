import { useRef } from "react";
import { motion } from "framer-motion";
import StrategicOverview from "@/components/dashboard/StrategicOverview";
import MarketExpansion from "@/components/dashboard/MarketExpansion";
import OperationalVelocity from "@/components/dashboard/OperationalVelocity";
import EcosystemGrowth from "@/components/dashboard/EcosystemGrowth";
import OrganizationalHealth from "@/components/dashboard/OrganizationalHealth";
import StrategicForecast from "@/components/dashboard/StrategicForecast";
import { DateRangeProvider, DateRangePicker } from "@/components/dashboard/DateRangePicker";
import ExportButton from "@/components/dashboard/ExportButton";
import { Activity } from "lucide-react";

const Index = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  return (
    <DateRangeProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md print:static print:bg-background">
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground tracking-tight">Atlas Sanctum</h1>
                <span className="text-xs text-muted-foreground">Strategic Command Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DateRangePicker />
              <div className="w-px h-6 bg-border/50 print:hidden" />
              <ExportButton targetRef={dashboardRef as React.RefObject<HTMLElement>} />
              <div className="w-px h-6 bg-border/50 print:hidden" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-xs text-muted-foreground">Live · March 2026</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main ref={dashboardRef} className="max-w-[1400px] mx-auto px-6 py-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Is the whole machine moving in the right direction? These signals compress complexity 
              into the trajectory indicators that matter—altitude, velocity, and orientation.
            </p>
          </motion.div>

          <StrategicOverview />
          <MarketExpansion />
          <OperationalVelocity />
          <EcosystemGrowth />
          <OrganizationalHealth />
          <StrategicForecast />

          {/* Footer */}
          <div className="border-t border-border/30 pt-6 pb-8 text-center">
            <p className="text-xs text-muted-foreground">
              Atlas Sanctum · Infrastructure for Regenerative Economics
            </p>
          </div>
        </main>
      </div>
    </DateRangeProvider>
  );
};

export default Index;
