import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Helper to log admin actions + create notification
    const logAction = async (actionName: string, targetUserId: string | null, targetEmail: string | null, details: Record<string, unknown> = {}) => {
      await adminClient.from("admin_activity_log").insert({
        admin_user_id: user.id,
        action: actionName,
        target_user_id: targetUserId,
        target_email: targetEmail,
        details,
      });
    };

    const notify = async (eventType: string, title: string, message: string, metadata: Record<string, unknown> = {}) => {
      await adminClient.from("admin_notifications").insert({
        event_type: eventType,
        title,
        message,
        metadata,
      });
    };

    if (req.method === "GET" && action === "list_users") {
      const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
      if (error) throw error;

      const { data: allRoles } = await adminClient.from("user_roles").select("*");

      const usersWithRoles = users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        banned_until: u.banned_until || null,
        roles: (allRoles || []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role),
      }));

      return new Response(JSON.stringify({ users: usersWithRoles }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "GET" && action === "activity_log") {
      const { data, error } = await adminClient
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      return new Response(JSON.stringify({ logs: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "set_role") {
      const { user_id, role, grant } = await req.json();
      if (!user_id || !role) {
        return new Response(JSON.stringify({ error: "user_id and role required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (grant) {
        const { error } = await adminClient
          .from("user_roles")
          .upsert({ user_id, role }, { onConflict: "user_id,role" });
        if (error) throw error;
      } else {
        const { error } = await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", user_id)
          .eq("role", role);
        if (error) throw error;
      }

      // Find target email for log
      const { data: { users: allUsers } } = await adminClient.auth.admin.listUsers({ perPage: 100 });
      const targetUser = allUsers?.find((u: any) => u.id === user_id);

      await logAction(
        grant ? "role_granted" : "role_revoked",
        user_id,
        targetUser?.email || null,
        { role }
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "invite_user") {
      const { email } = await req.json();
      if (!email) {
        return new Response(JSON.stringify({ error: "email required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email);
      if (error) throw error;

      await logAction("user_invited", data.user?.id || null, email, {});

      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "toggle_ban") {
      const { user_id, ban } = await req.json();
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent self-ban
      if (user_id === user.id) {
        return new Response(JSON.stringify({ error: "Cannot suspend your own account" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateData = ban
        ? { ban_duration: "876000h" } // ~100 years
        : { ban_duration: "none" };

      const { error } = await adminClient.auth.admin.updateUserById(user_id, updateData);
      if (error) throw error;

      const { data: { users: allUsers } } = await adminClient.auth.admin.listUsers({ perPage: 100 });
      const targetUser = allUsers?.find((u: any) => u.id === user_id);

      await logAction(
        ban ? "user_suspended" : "user_reactivated",
        user_id,
        targetUser?.email || null,
        {}
      );

      await notify(
        ban ? "user_suspended" : "user_reactivated",
        ban ? "User Suspended" : "User Reactivated",
        `${targetUser?.email || user_id} was ${ban ? "suspended" : "reactivated"} by admin.`,
        { target_email: targetUser?.email, admin_email: user.email }
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
