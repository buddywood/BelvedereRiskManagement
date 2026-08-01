"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { changeEnterpriseAdminRoleByAdmin } from "@/lib/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AdminMemberRow = {
  membershipId: string;
  userId: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "ADVISOR";
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
};

type Props = {
  enterpriseId: string;
  members: AdminMemberRow[];
};

function memberLabel(m: AdminMemberRow) {
  const who = m.name?.trim() || m.email || m.userId;
  return m.email ? `${who} (${m.email})` : who;
}

/**
 * Platform-admin control to add additional firm administrators (ADMIN role).
 * Firms keep a single billing OWNER; this panel promotes active/invited team
 * members to ADMIN or demotes ADMIN back to team member.
 */
export function AdminEnterpriseAdminsPanel({ enterpriseId, members }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const admins = members.filter((m) => m.role === "ADMIN");
  const promoteCandidates = members.filter(
    (m) =>
      m.role === "ADVISOR" &&
      (m.status === "ACTIVE" || m.status === "INVITED")
  );
  const chosen = promoteCandidates.find((m) => m.membershipId === selected) ?? null;

  const onPromote = async () => {
    if (!chosen) return;
    setPendingId(chosen.membershipId);
    try {
      const result = await changeEnterpriseAdminRoleByAdmin({
        enterpriseId,
        membershipId: chosen.membershipId,
        role: "ADMIN",
      });
      if (result.success) {
        toast.success(
          `${chosen.name?.trim() || chosen.email || "Member"} is now a firm administrator`
        );
        setSelected("");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to add firm administrator");
      }
    } finally {
      setPendingId(null);
    }
  };

  const onDemote = async (member: AdminMemberRow) => {
    if (
      !window.confirm(
        `Remove firm administrator access for ${memberLabel(member)}?\n\n` +
          `They stay on the firm as a team member.`
      )
    ) {
      return;
    }
    setPendingId(member.membershipId);
    try {
      const result = await changeEnterpriseAdminRoleByAdmin({
        enterpriseId,
        membershipId: member.membershipId,
        role: "ADVISOR",
      });
      if (result.success) {
        toast.success("Firm administrator access removed");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to update role");
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Firms have one billing owner. Add as many firm administrators as you need —
        they can manage the team and firm settings, but not Stripe billing.
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium">Current administrators</p>
        {admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No firm administrators yet.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {admins.map((admin) => {
              const busy = pendingId === admin.membershipId;
              return (
                <div
                  key={admin.membershipId}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {admin.name?.trim() || admin.email || admin.userId}
                    </p>
                    {admin.name && admin.email ? (
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Admin</Badge>
                    <Badge variant={admin.status === "ACTIVE" ? "default" : "secondary"}>
                      {admin.status}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy || !!pendingId}
                      onClick={() => void onDemote(admin)}
                    >
                      {busy ? "Updating…" : "Make team member"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {promoteCandidates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No other active or invited team members are available to promote. Invite a
          member on the firm team page first, or transfer ownership if you need a
          different billing owner.
        </p>
      ) : (
        <div className="max-w-sm space-y-2">
          <Label htmlFor="new-firm-admin">Add firm administrator</Label>
          <Select
            value={selected}
            onValueChange={setSelected}
            disabled={!!pendingId}
          >
            <SelectTrigger id="new-firm-admin">
              <SelectValue placeholder="Choose a team member…" />
            </SelectTrigger>
            <SelectContent>
              {promoteCandidates.map((m) => (
                <SelectItem key={m.membershipId} value={m.membershipId}>
                  {memberLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Promotes an existing firm member to administrator. This does not change
            the billing owner.
          </p>
          <Button
            type="button"
            size="sm"
            disabled={!chosen || !!pendingId}
            onClick={() => void onPromote()}
          >
            {pendingId && chosen && pendingId === chosen.membershipId
              ? "Adding…"
              : "Add administrator"}
          </Button>
        </div>
      )}
    </div>
  );
}
