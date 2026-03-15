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
      {/* Header */}
      <div className="space-y-1">
        <p className="editorial-kicker">Client management</p>
        <h1 className="text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
          Client Invitations
        </h1>
        <p className="text-sm text-muted-foreground">
          Send and manage invitations for client family governance assessments.
        </p>
      </div>

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