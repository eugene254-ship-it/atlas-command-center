import { motion } from "framer-motion";
import { UserPlus, Download, Bell, Shield, RefreshCw, BarChart3 } from "lucide-react";
import DashboardSection from "./DashboardSection";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Invite User",
      icon: UserPlus,
      description: "Send new invitation",
      onClick: () => navigate("/admin"),
    },
    {
      label: "Manage Roles",
      icon: Shield,
      description: "Assign permissions",
      onClick: () => navigate("/admin"),
    },
    {
      label: "View Alerts",
      icon: Bell,
      description: "Check thresholds",
      onClick: () => {
        document.querySelector('[data-alert-trigger]')?.dispatchEvent(new Event('click', { bubbles: true }));
        toast.info("Opening alerts panel");
      },
    },
    {
      label: "Export Report",
      icon: Download,
      description: "Generate PDF/PNG",
      onClick: () => {
        document.querySelector('[data-export-trigger]')?.dispatchEvent(new Event('click', { bubbles: true }));
        toast.info("Opening export options");
      },
    },
    {
      label: "Refresh Data",
      icon: RefreshCw,
      description: "Force sync metrics",
      onClick: async () => {
        toast.promise(
          new Promise((resolve) => {
            window.dispatchEvent(new Event('force-refresh-metrics'));
            setTimeout(resolve, 1000);
          }),
          {
            loading: "Refreshing metrics…",
            success: "Metrics refreshed",
            error: "Refresh failed",
          }
        );
      },
    },
    {
      label: "Analytics",
      icon: BarChart3,
      description: "Deep dive metrics",
      onClick: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.info("Scroll to top for overview");
      },
    },
  ];

  return (
    <DashboardSection title="Quick Actions — Command Shortcuts" delay={0.1}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            onClick={action.onClick}
            className="glass-surface rounded-lg p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-card/90 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-md bg-secondary/80 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight text-center">{action.description}</span>
          </motion.button>
        ))}
      </div>
    </DashboardSection>
  );
};

export default QuickActions;
