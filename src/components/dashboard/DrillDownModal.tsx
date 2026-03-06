import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface DrillDownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const DrillDownModal = ({ open, onOpenChange, title, subtitle, children }: DrillDownModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[95vw] sm:max-w-3xl bg-card border-border/50 text-foreground p-0 gap-0 overflow-hidden">
      <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-sm sm:text-base font-semibold text-foreground">{title}</DialogTitle>
            {subtitle && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
      </DialogHeader>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-4 sm:px-6 py-4 sm:py-5 max-h-[70vh] overflow-y-auto"
      >
        {children}
      </motion.div>
    </DialogContent>
  </Dialog>
);

export default DrillDownModal;

// Reusable data table for drill-downs
export const DrillDownTable = ({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => (
  <div className="border border-border/30 rounded-md overflow-x-auto">
    <table className="w-full text-xs min-w-[400px]">
      <thead>
        <tr className="bg-secondary/50">
          {headers.map((h) => (
            <th key={h} className="px-3 sm:px-4 py-2 sm:py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-border/20 hover:bg-secondary/30 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className={`px-3 sm:px-4 py-2 sm:py-2.5 whitespace-nowrap ${j > 0 ? "font-mono text-foreground" : "text-muted-foreground"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Stat row for drill-downs
export const DrillDownStat = ({ label, value, change, positive }: { label: string; value: string; change?: string; positive?: boolean }) => (
  <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-border/20 last:border-0">
    <span className="text-[11px] sm:text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="font-mono text-xs sm:text-sm text-foreground">{value}</span>
      {change && (
        <span className={`text-[10px] sm:text-xs font-medium ${positive ? "text-primary" : "text-destructive"}`}>
          {change}
        </span>
      )}
    </div>
  </div>
);
