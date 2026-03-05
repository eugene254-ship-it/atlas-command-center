import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface DrillDownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const DrillDownModal = ({ open, onOpenChange, title, subtitle, children }: DrillDownModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl bg-card border-border/50 text-foreground p-0 gap-0 overflow-hidden">
      <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
      </DialogHeader>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-6 py-5 max-h-[70vh] overflow-y-auto"
      >
        {children}
      </motion.div>
    </DialogContent>
  </Dialog>
);

export default DrillDownModal;

// Reusable data table for drill-downs
export const DrillDownTable = ({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) => (
  <div className="border border-border/30 rounded-md overflow-hidden">
    <table className="w-full text-xs">
      <thead>
        <tr className="bg-secondary/50">
          {headers.map((h) => (
            <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-border/20 hover:bg-secondary/30 transition-colors">
            {row.map((cell, j) => (
              <td key={j} className={`px-4 py-2.5 ${j > 0 ? "font-mono text-foreground" : "text-muted-foreground"}`}>
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
  <div className="flex items-center justify-between py-2.5 border-b border-border/20 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="flex items-center gap-3">
      <span className="font-mono text-sm text-foreground">{value}</span>
      {change && (
        <span className={`text-xs font-medium ${positive ? "text-primary" : "text-destructive"}`}>
          {change}
        </span>
      )}
    </div>
  </div>
);
