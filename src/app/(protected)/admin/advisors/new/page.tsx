import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminAddAdvisorForm } from "@/components/admin/AdminAddAdvisorForm";

export default function AdminNewAdvisorPage() {
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
      <AdminAddAdvisorForm />
    </div>
  );
}
