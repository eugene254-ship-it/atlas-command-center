import { useState, useEffect, useCallback, useMemo } from "react";
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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  Ban,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserRecord {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
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
const USERS_PER_PAGE = 10;
const LOGS_PER_PAGE = 15;

const ACTION_LABELS: Record<string, string> = {
  role_granted: "Granted role",
  role_revoked: "Revoked role",
  user_invited: "Invited user",
  user_suspended: "Suspended user",
  user_reactivated: "Reactivated user",
};

const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border/20">
      <span className="text-[11px] text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded-md border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded-md border border-border/30 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
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

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // Pagination
  const [usersPage, setUsersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ role: string; grant: boolean } | null>(null);
  const [banningUser, setBanningUser] = useState<string | null>(null);

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

  // Filtered + paginated users
  const filteredUsers = useMemo(() => {
    let result = users;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((u) => u.email.toLowerCase().includes(q));
    }
    if (roleFilter) {
      result = result.filter((u) => u.roles.includes(roleFilter));
    }
    return result;
  }, [users, searchQuery, roleFilter]);

  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (usersPage - 1) * USERS_PER_PAGE,
    usersPage * USERS_PER_PAGE
  );

  useEffect(() => { setUsersPage(1); }, [searchQuery, roleFilter]);

  const logsTotalPages = Math.max(1, Math.ceil(logs.length / LOGS_PER_PAGE));
  const paginatedLogs = logs.slice(
    (logsPage - 1) * LOGS_PER_PAGE,
    logsPage * LOGS_PER_PAGE
  );

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allPageSelected = paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedIds.has(u.id));
  const somePageSelected = paginatedUsers.some((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        paginatedUsers.forEach((u) => next.delete(u.id));
      } else {
        paginatedUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  const bulkSetRole = async (role: string, grant: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkProcessing(true);
    let success = 0;
    let failed = 0;
    for (const userId of selectedIds) {
      try {
        await apiCall("set_role", "POST", { user_id: userId, role, grant });
        success++;
      } catch {
        failed++;
      }
    }
    toast({
      title: `Bulk ${grant ? "grant" : "revoke"} complete`,
      description: `${success} succeeded${failed ? `, ${failed} failed` : ""}.`,
    });
    setSelectedIds(new Set());
    setBulkProcessing(false);
    setConfirmAction(null);
    await fetchUsers();
  };

  const toggleBan = async (userId: string, ban: boolean) => {
    setBanningUser(userId);
    try {
      await apiCall("toggle_ban", "POST", { user_id: userId, ban });
      toast({ title: ban ? "User suspended" : "User reactivated" });
      await fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setBanningUser(null);
    }
  };

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

  const exportUsersCsv = () => {
    downloadCsv(
      "users.csv",
      ["Email", "Roles", "Verified", "Joined", "Last Sign In"],
      filteredUsers.map((u) => [
        u.email,
        u.roles.join("; "),
        u.email_confirmed_at ? "Yes" : "No",
        new Date(u.created_at).toLocaleDateString(),
        u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never",
      ])
    );
  };

  const exportLogsCsv = () => {
    downloadCsv(
      "activity-log.csv",
      ["Action", "Target Email", "Details", "Timestamp"],
      logs.map((l) => [
        ACTION_LABELS[l.action] || l.action,
        l.target_email || "",
        JSON.stringify(l.details),
        new Date(l.created_at).toLocaleString(),
      ])
    );
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

        {/* Tabs + Export */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
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
          <button
            onClick={activeTab === "users" ? exportUsersCsv : exportLogsCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border/30 bg-secondary/30 text-muted-foreground hover:text-foreground transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by email…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm h-9"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRoleFilter(null)}
                      className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                        !roleFilter
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-secondary/30 text-muted-foreground border-border/30 hover:text-foreground"
                      }`}
                    >
                      All
                    </button>
                    {ROLE_OPTIONS.map((role) => (
                      <button
                        key={role}
                        onClick={() => setRoleFilter(roleFilter === role ? null : role)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-all capitalize ${
                          roleFilter === role
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-secondary/30 text-muted-foreground border-border/30 hover:text-foreground"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bulk actions bar */}
              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-surface rounded-lg border border-primary/20 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {selectedIds.size} selected
                      </span>
                      <span className="text-[11px] text-muted-foreground">—</span>
                      {ROLE_OPTIONS.map((role) => (
                        <div key={role} className="flex gap-1">
                          <button
                            onClick={() => setConfirmAction({ role, grant: true })}
                            disabled={bulkProcessing}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
                          >
                            {bulkProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Grant {role}
                          </button>
                          <button
                            onClick={() => setConfirmAction({ role, grant: false })}
                            disabled={bulkProcessing}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border bg-secondary/30 text-muted-foreground border-border/30 hover:text-foreground transition-all disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Revoke
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="ml-auto text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filtered count */}
              {(searchQuery || roleFilter) && (
                <p className="text-[11px] text-muted-foreground">
                  Showing {filteredUsers.length} of {users.length} users
                  {roleFilter && <span> · filtered by <span className="text-primary font-medium">{roleFilter}</span></span>}
                </p>
              )}

              {/* Users Table */}
              <div className="glass-surface rounded-xl overflow-hidden border border-border/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="w-10 px-3 py-3">
                          <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                            {allPageSelected ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : somePageSelected ? (
                              <MinusSquare className="w-4 h-4 text-primary/60" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Last Sign In</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Roles</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No users found.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((u, i) => {
                          const isSelected = selectedIds.has(u.id);
                          return (
                            <motion.tr
                              key={u.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.03 }}
                              className={`border-b border-border/20 last:border-0 transition-colors ${
                                isSelected ? "bg-primary/5" : "hover:bg-secondary/20"
                              }`}
                            >
                              <td className="w-10 px-3 py-3">
                                <button onClick={() => toggleSelect(u.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className={`text-xs sm:text-sm truncate max-w-[180px] ${u.banned_until ? "text-muted-foreground line-through" : "text-foreground"}`}>{u.email}</span>
                                  {u.banned_until && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                      <Ban className="w-2.5 h-2.5" /> Suspended
                                    </span>
                                  )}
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
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <button
                                  onClick={() => toggleBan(u.id, !u.banned_until)}
                                  disabled={banningUser === u.id}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all ${
                                    u.banned_until
                                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                      : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                                  }`}
                                >
                                  {banningUser === u.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : u.banned_until ? (
                                    <UserCheck className="w-3 h-3" />
                                  ) : (
                                    <Ban className="w-3 h-3" />
                                  )}
                                  {u.banned_until ? "Reactivate" : "Suspend"}
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination page={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
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
                <>
                  <div className="divide-y divide-border/20">
                    {paginatedLogs.map((log) => (
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
                  <Pagination page={logsPage} totalPages={logsTotalPages} onPageChange={setLogsPage} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk confirmation dialog */}
        <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm bulk role change</AlertDialogTitle>
              <AlertDialogDescription>
                This will {confirmAction?.grant ? "grant" : "revoke"} the <span className="font-semibold text-foreground">{confirmAction?.role}</span> role
                for {selectedIds.size} selected user{selectedIds.size !== 1 ? "s" : ""}. This action will be logged.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmAction && bulkSetRole(confirmAction.role, confirmAction.grant)}
              >
                {confirmAction?.grant ? "Grant" : "Revoke"} Role
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Admin;
