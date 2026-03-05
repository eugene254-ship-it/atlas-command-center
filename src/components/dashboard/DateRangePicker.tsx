import { createContext, useContext, useState, ReactNode } from "react";

export type DateRange = "7d" | "30d" | "90d" | "12m" | "all";

interface DateRangeContextType {
  range: DateRange;
  setRange: (range: DateRange) => void;
  label: string;
}

const labels: Record<DateRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
  "all": "All time",
};

const DateRangeContext = createContext<DateRangeContextType>({
  range: "12m",
  setRange: () => {},
  label: "Last 12 months",
});

export const useDateRange = () => useContext(DateRangeContext);

export const DateRangeProvider = ({ children }: { children: ReactNode }) => {
  const [range, setRange] = useState<DateRange>("12m");
  return (
    <DateRangeContext.Provider value={{ range, setRange, label: labels[range] }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const DateRangePicker = () => {
  const { range, setRange } = useDateRange();
  const options: DateRange[] = ["7d", "30d", "90d", "12m", "all"];

  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setRange(opt)}
          className={`px-2.5 py-1 text-xs rounded-md transition-all font-medium ${
            range === opt
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-secondary/50 text-muted-foreground border border-border/50 hover:text-foreground"
          }`}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
