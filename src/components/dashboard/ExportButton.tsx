import { useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Image, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
}

const ExportButton = ({ targetRef }: ExportButtonProps) => {
  const exportAsPNG = useCallback(async () => {
    if (!targetRef.current) return;
    try {
      toast.info("Generating snapshot...");
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: "#0f1318",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `atlas-sanctum-dashboard-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Dashboard exported as PNG");
    } catch {
      toast.error("Export failed");
    }
  }, [targetRef]);

  const printAsPDF = useCallback(() => {
    toast.info("Opening print dialog...");
    window.print();
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={exportAsPNG}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-secondary/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-secondary transition-all font-medium"
        title="Export as PNG"
      >
        <Image className="w-3 h-3" />
        PNG
      </button>
      <button
        onClick={printAsPDF}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-secondary/50 text-muted-foreground border border-border/50 hover:text-foreground hover:bg-secondary transition-all font-medium"
        title="Print as PDF"
      >
        <FileText className="w-3 h-3" />
        PDF
      </button>
    </div>
  );
};

export default ExportButton;
