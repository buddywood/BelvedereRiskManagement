import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdvisorForAdmin } from "@/lib/admin/queries";
import { AdminEditAdvisorForm } from "@/components/admin/AdminEditAdvisorForm";

export default async function AdminEditAdvisorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const advisor = await getAdvisorForAdmin(id);
  if (!advisor) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/advisors" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Advisors
          </Link>
        </Button>
      </div>
      <AdminEditAdvisorForm advisor={advisor} />
    </div>
  );
}
