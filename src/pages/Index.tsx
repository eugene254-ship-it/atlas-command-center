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
import AlertNotifications from "@/components/dashboard/AlertNotifications";
import { Activity, Menu } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <DateRangeProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md print:static print:bg-background">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary/20 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">Atlas Sanctum</h1>
                <span className="text-[10px] sm:text-xs text-muted-foreground hidden xs:inline">Strategic Command Panel</span>
              </div>
            </div>

            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-4">
              <DateRangePicker />
              <div className="w-px h-6 bg-border/50 print:hidden" />
              <ExportButton targetRef={dashboardRef as React.RefObject<HTMLElement>} />
              <div className="w-px h-6 bg-border/50 print:hidden" />
              <AlertNotifications />
              <div className="w-px h-6 bg-border/50 print:hidden" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-xs text-muted-foreground">Live · March 2026</span>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <AlertNotifications />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-md bg-secondary/50 text-muted-foreground border border-border/50 hover:text-foreground transition-all print:hidden"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/30 px-4 py-3 space-y-3 bg-background/95 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Time Range</span>
                <DateRangePicker />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Export</span>
                <ExportButton targetRef={dashboardRef as React.RefObject<HTMLElement>} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-xs text-muted-foreground">Live · March 2026</span>
              </div>
            </motion.div>
          )}
        </header>

        {/* Dashboard Content */}
        <main ref={dashboardRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
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
