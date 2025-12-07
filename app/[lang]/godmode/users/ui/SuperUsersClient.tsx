"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Props = {
  lang: string;
};

type UserRow = {
  id: string;
  email: string;
  roles: string[];
  blocked: boolean;
  user_metadata: Record<string, any>;
};

export default function SuperUsersClient({ lang }: Props) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /* ============================
     Load all users
  ============================ */
  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_all_users_with_roles");

    if (error) {
      toast({
        title: "Fout bij laden van gebruikers",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setUsers(
      data.map((u: any) => ({
        id: u.id,
        email: u.email,
        roles: u.roles ?? [],
        blocked: u.blocked ?? false,
        user_metadata: u.user_metadata ?? {},
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  /* ============================
      Helper: toggle a role
  ============================ */
  function toggleRole(current: string[], role: string) {
    const low = current.map((r) => r.toLowerCase());
    if (low.includes(role.toLowerCase())) {
      return current.filter((r) => r.toLowerCase() !== role.toLowerCase());
    }
    return [...current, role];
  }

  /* ============================
      Update roles in Supabase
  ============================ */
  async function updateRoles(userId: string, newRoles: string[]) {
    setUpdatingId(userId);

    const { error } = await supabase.rpc("update_user_roles", {
      target_user: userId,
      new_roles: newRoles,
    });

    if (error) {
      toast({
        title: "Kon rollen niet bijwerken",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rollen bijgewerkt",
      });
      await loadUsers();
    }

    setUpdatingId(null);
  }

  /* ============================
      Toggle Block User
  ============================ */
  async function toggleBlocked(u: UserRow) {
    setUpdatingId(u.id);

    const { error } = await supabase.rpc("toggle_user_block", {
      target_user: u.id,
    });

    if (error) {
      toast({
        title: "Kon blokkade niet wijzigen",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: u.blocked ? "Gebruiker gedeblokkeerd" : "Gebruiker geblokkeerd",
      });
      await loadUsers();
    }

    setUpdatingId(null);
  }

  /* ============================
      RENDER
  ============================ */
  return (
    <Card className="w-full shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          GodMode – Gebruikersbeheer
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Laden...</p>
        ) : (
          <div className="space-y-6">
            {users.map((u) => {
              const lower = u.roles.map((r) => r.toLowerCase());
              const isSuper = lower.includes("super_admin");
              const isAdmin = lower.includes("admin");
              const isBusiness = lower.includes("business_owner");
              const isBlocked = u.blocked;

              return (
                <div
                  key={u.id}
                  className="p-4 border rounded-lg shadow-sm bg-card"
                >
                  <div className="font-semibold">{u.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Rollen: {u.roles.join(", ") || "geen"}
                  </div>

                  <div className="flex gap-3 mt-4 flex-wrap">
                    {/* SUPER ADMIN toggle? Nee. Alleen bekijken */}
                    <Button
                      variant={isAdmin ? "default" : "outline"}
                      disabled={updatingId === u.id || isSuper}
                      size="sm"
                      onClick={() =>
                        updateRoles(u.id, toggleRole(u.roles, "admin"))
                      }
                    >
                      admin
                    </Button>

                    <Button
                      variant={isBusiness ? "default" : "outline"}
                      disabled={updatingId === u.id || isSuper}
                      size="sm"
                      onClick={() =>
                        updateRoles(u.id, toggleRole(u.roles, "business_owner"))
                      }
                    >
                      business
                    </Button>

                    <Button
                      variant={isBlocked ? "default" : "outline"}
                      disabled={updatingId === u.id || isSuper}
                      size="sm"
                      onClick={() => toggleBlocked(u)}
                    >
                      {isBlocked ? "Deblokkeren" : "Blokkeren"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}