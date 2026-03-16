import { redirect } from "next/navigation";
import { getClientDocumentRequirements } from "@/lib/actions/document-actions";
import { ClientDocumentPortal } from "@/components/documents/ClientDocumentPortal";

export default async function DocumentsPage() {
  const result = await getClientDocumentRequirements();

  if (!result.success) {
    if (result.error === 'Not authenticated') {
      redirect('/auth/signin');
    }

    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive mb-2">
          Error Loading Documents
        </h2>
        <p className="text-muted-foreground">
          {result.error}
        </p>
      </div>
    );
  }

  const advisorGroups = result.data || [];

  // If no requirements from any advisor, show empty state
  if (advisorGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">No Document Requirements</h2>
        <p className="text-muted-foreground">
          No document requirements yet. Your advisor will request documents when needed.
        </p>
      </div>
    );
  }

  // For now, display requirements from the first advisor
  // In the future, this could be enhanced to handle multiple advisors
  const firstGroup = advisorGroups[0];
  const advisorInfo = {
    firmName: firstGroup.advisor.firmName,
    logoUrl: firstGroup.advisor.logoUrl,
  };

  return (
    <ClientDocumentPortal
      requirements={firstGroup.requirements}
      advisorInfo={advisorInfo}
    />
  );
}