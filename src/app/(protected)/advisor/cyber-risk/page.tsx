import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCyberRiskDashboardData } from "@/lib/actions/advisor-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CyberRiskLoading from "./loading";

// Async component for data-dependent content
async function CyberRiskContent() {
  const result = await getCyberRiskDashboardData();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive text-sm">Error loading cyber risk dashboard: {result.error}</p>
        </div>
      </div>
    );
  }

  const { clients, metrics } = result.data!;

  // Check if any clients have completed cyber risk assessments
  if (clients.length === 0 || metrics.assessedClients === 0) {
    return (
      <div className="space-y-6">
        {/* Show metrics even for empty state */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="hero-surface rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-semibold">{metrics.totalClients}</p>
            </div>
          </div>
          <div className="hero-surface rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Assessed</p>
              <p className="text-2xl font-semibold">{metrics.assessedClients}</p>
            </div>
          </div>
          <div className="hero-surface rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-semibold">—</p>
            </div>
          </div>
          <div className="hero-surface rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">At Risk</p>
              <p className="text-2xl font-semibold">{metrics.clientsAtRisk}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No clients have completed cyber risk assessments yet.
          </p>
        </div>
      </div>
    );
  }

  // Sort clients by risk level (critical first, then high, medium, low, unassessed last)
  const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedClients = [...clients].sort((a, b) => {
    if (a.riskLevel === null && b.riskLevel === null) return 0;
    if (a.riskLevel === null) return 1; // unassessed last
    if (b.riskLevel === null) return -1; // unassessed last
    return (riskOrder[a.riskLevel] || 4) - (riskOrder[b.riskLevel] || 4);
  });

  return (
    <div className="space-y-6">
      {/* Metrics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-semibold">{metrics.totalClients}</p>
          </div>
        </div>
        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Assessed</p>
            <p className="text-2xl font-semibold">{metrics.assessedClients}</p>
          </div>
        </div>
        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-2xl font-semibold">
              {metrics.averageScore ? `${metrics.averageScore.toFixed(1)} / 10` : '—'}
            </p>
          </div>
        </div>
        <div className="hero-surface rounded-lg p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">At Risk</p>
            <p className={`text-2xl font-semibold ${
              metrics.clientsAtRisk > 0 ? 'text-amber-600 dark:text-amber-400' : ''
            }`}>
              {metrics.clientsAtRisk}
            </p>
          </div>
        </div>
      </div>

      {/* Client table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Cyber Risk Portfolio</CardTitle>
          <CardDescription>
            View cyber risk scores, risk levels, and assessment status for all assigned families.
            Click column headers to sort data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Client Name
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Cyber Risk Score
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Risk Level
                  </th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">
                    Assessed Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="p-2 font-medium">
                      {client.name || 'Unnamed Client'}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {client.email}
                    </td>
                    <td className="p-2">
                      {client.cyberScore !== null
                        ? `${client.cyberScore.toFixed(1)} / 10`
                        : 'Not assessed'
                      }
                    </td>
                    <td className="p-2">
                      {client.riskLevel ? (
                        <Badge
                          variant={
                            client.riskLevel === 'CRITICAL' ? 'destructive' :
                            client.riskLevel === 'HIGH' ? 'default' :
                            client.riskLevel === 'MEDIUM' ? 'secondary' :
                            'outline'
                          }
                          className={
                            client.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                              : ''
                          }
                        >
                          {client.riskLevel.charAt(0) + client.riskLevel.slice(1).toLowerCase()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not assessed</Badge>
                      )}
                    </td>
                    <td className="p-2 text-muted-foreground">
                      {client.assessedAt
                        ? client.assessedAt.toLocaleDateString()
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CyberRiskDashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link
          href="/advisor"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal
        </Link>
      </div>

      {/* Data-dependent content with Suspense streaming */}
      <Suspense fallback={<CyberRiskLoading />}>
        <CyberRiskContent />
      </Suspense>
    </div>
  );
}