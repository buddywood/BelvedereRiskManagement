import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteClientForm } from "@/components/advisor/invitations/InviteClientForm";
import { InvitationTable } from "@/components/advisor/invitations/InvitationTable";
import { getInvitationsAction } from "@/lib/actions/invitations";

export default async function InvitationsPage() {
  const result = await getInvitationsAction();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">
            Error loading invitations: {result.error}
          </p>
        </div>
      </div>
    );
  }

  const invitations = result.data!;

  return (
    <div className="space-y-8">

      {/* Invite Form */}
      <InviteClientForm />

      {/* Section Divider */}
      <div className="border-t section-divider" />

      {/* Invitations Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Invitation History</h2>
        <InvitationTable invitations={invitations} />
      </div>
    </div>
  );
}