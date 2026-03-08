import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  roles: string[];
}

const ROLE_OPTIONS = ["admin", "moderator", "user"] as const;

const Admin = () => {
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      });
      // The invoke with GET doesn't support query params well, so let's use fetch directly
    } catch {}

    // Use direct fetch for GET with query params
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=list_users`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      }
    );
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users || []);
    } else {
      const err = await res.json().catch(() => ({}));
      toast({ title: "Error loading users", description: err.error || "Unknown error", variant: "destructive" });
    }
    setLoading(false);
  }, [session, toast]);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!isAdmin) {
        navigate("/");
        return;
      }
      fetchUsers();
    }
  }, [authLoading, roleLoading, isAdmin, navigate, fetchUsers]);

  const toggleRole = async (userId: string, role: string, currentlyHas: boolean) => {
    if (!session) return;
    setToggling(`${userId}-${role}`);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=set_role`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, role, grant: !currentlyHas }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error);
      toast({ title: `Role ${!currentlyHas ? "granted" : "revoked"}`, description: `${role} role updated.` });
      await fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-1.5 rounded-md bg-secondary/50 text-muted-foreground border border-border/50 hover:text-foreground transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">Admin Panel</h1>
              <span className="text-xs text-muted-foreground">User & Role Management</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{users.length} users</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Users Table */}
          <div className="glass-surface rounded-xl overflow-hidden border border-border/30">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Last Sign In</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground text-xs sm:text-sm truncate max-w-[180px]">{u.email}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 pl-5.5">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {u.email_confirmed_at ? (
                          <span className="inline-flex items-center gap-1 text-xs text-primary">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-accent">
                            <XCircle className="w-3 h-3" /> Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {u.last_sign_in_at
                            ? new Date(u.last_sign_in_at).toLocaleString()
                            : "Never"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {ROLE_OPTIONS.map((role) => {
                            const has = u.roles.includes(role);
                            const isToggling = toggling === `${u.id}-${role}`;
                            const Icon = role === "admin" ? ShieldAlert : role === "moderator" ? ShieldCheck : Shield;
                            return (
                              <button
                                key={role}
                                onClick={() => toggleRole(u.id, role, has)}
                                disabled={isToggling}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                                  has
                                    ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25"
                                    : "bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/50 hover:text-foreground"
                                }`}
                              >
                                {isToggling ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Icon className="w-3 h-3" />
                                )}
                                {role}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
