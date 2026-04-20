import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getClientDetailData } from "@/lib/actions/pipeline-actions";
import { ClientDetailView } from "@/components/pipeline/ClientDetailView";
import ClientDetailLoading from "./loading";

interface ClientDetailPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

async function ClientDetailContent({ clientId }: { clientId: string }) {
  const result = await getClientDetailData(clientId);

  if (!result.success) {
    if (result.error?.includes('not found')) {
      notFound();
    }
    throw new Error(result.error || 'Failed to load client data');
  }

  return <ClientDetailView detail={result.data!} />;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params;

  return (
    <Suspense fallback={<ClientDetailLoading />}>
      <ClientDetailContent clientId={clientId} />
    </Suspense>
  );
}