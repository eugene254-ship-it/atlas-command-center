import { Lock } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminSectionProps {
  children: React.ReactNode;
  label?: string;
}

const AdminSection = ({ children, label = "This section" }: AdminSectionProps) => {
  const { isAdmin, loading } = useUserRole();

  if (loading) return null;

  if (!isAdmin) {
    return (
      <div className="glass-surface rounded-xl p-6 flex items-center gap-3 text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span className="text-xs">{label} requires admin access.</span>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminSection;
