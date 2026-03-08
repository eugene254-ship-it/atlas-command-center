import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
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
  UserPlus,
  ScrollText,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  roles: string[];
}

interface ActivityLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id: string | null;
  target_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const ROLE_OPTIONS = ["admin", "moderator", "user"] as const;

const ACTION_LABELS: Record<string, string> = {
  role_granted: "Granted role",
  role_revoked: "Revoked role",
  user_invited: "Invited user",
};

const Admin = () => {
  const { session, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "log">("users");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const apiCall = useCallback(
    async (action: string, method: string, body?: Record<string, unknown>) => {
      if (!session) throw new Error("No session");
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=${action}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      return json;
    },
    [session]
  );

  const fetchUsers = useCallback(async () => {
    try {
      const json = await apiCall("list_users", "GET");
      setUsers(json.users || []);
    } catch (err: any) {
      toast({ title: "Error loading users", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }, [apiCall, toast]);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const json = await apiCall("activity_log", "GET");
      setLogs(json.logs || []);
    } catch (err: any) {
      toast({ title: "Error loading logs", description: err.message, variant: "destructive" });
    }
    setLogsLoading(false);
  }, [apiCall, toast]);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!isAdmin) {
        navigate("/");
        return;
      }
      fetchUsers();
    }
  }, [authLoading, roleLoading, isAdmin, navigate, fetchUsers]);

  useEffect(() => {
    if (activeTab === "log" && isAdmin) fetchLogs();
  }, [activeTab, isAdmin, fetchLogs]);

  const toggleRole = async (userId: string, role: string, currentlyHas: boolean) => {
    setToggling(`${userId}-${role}`);
    try {
      await apiCall("set_role", "POST", { user_id: userId, role, grant: !currentlyHas });
      toast({ title: `Role ${!currentlyHas ? "granted" : "revoked"}`, description: `${role} role updated.` });
      await fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await apiCall("invite_user", "POST", { email: inviteEmail.trim() });
      toast({ title: "Invitation sent", description: `Invite email sent to ${inviteEmail}` });
      setInviteEmail("");
      await fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
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
        {/* Invite User */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-surface rounded-xl border border-border/30 p-4 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Invite User</span>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); inviteUser(); }}
            className="flex gap-2"
          >
            <Input
              type="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button type="submit" disabled={inviting || !inviteEmail.trim()} size="sm" className="gap-1.5">
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Invite
            </Button>
          </form>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {([["users", Users, "Users"], ["log", ScrollText, "Activity Log"]] as const).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as "users" | "log")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                activeTab === key
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-secondary/30 text-muted-foreground border-border/30 hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-surface rounded-xl overflow-hidden border border-border/30"
            >
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
                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}
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
                                  {isToggling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Icon className="w-3 h-3" />}
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
            </motion.div>
          )}

          {activeTab === "log" && (
            <motion.div
              key="log"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-surface rounded-xl overflow-hidden border border-border/30"
            >
              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No activity recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border/20">
                  {logs.map((log) => (
                    <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ScrollText className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{ACTION_LABELS[log.action] || log.action}</span>
                          {log.target_email && (
                            <span className="text-muted-foreground"> — {log.target_email}</span>
                          )}
                          {(log.details as any)?.role && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                              {(log.details as any).role}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
