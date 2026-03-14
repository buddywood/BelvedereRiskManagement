import Link from "next/link";
import { User, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdvisorDashboardClient } from "@/lib/advisor/types";

interface ClientCardProps {
  client: AdvisorDashboardClient;
}

export function ClientCard({ client }: ClientCardProps) {
  const { name, email, assignedAt, latestInterview } = client;

  // Status badge configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return {
          label: 'Not Started',
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        };
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="h-full transition-colors hover:bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium leading-none">
              {name || "Unnamed Client"}
            </h3>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {email}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assignment info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Assigned {formatDate(assignedAt)}</span>
        </div>

        {/* Intake status */}
        {latestInterview ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Intake Status</span>
              </div>
              <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                getStatusConfig(latestInterview.status).className
              }`}>
                {getStatusConfig(latestInterview.status).label}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              {latestInterview.responseCount}/10 questions answered
            </div>

            {/* Action button */}
            {latestInterview.status === 'SUBMITTED' ? (
              <Button asChild size="sm" className="w-full">
                <Link href={`/advisor/review/${latestInterview.id}`}>
                  Review Intake
                </Link>
              </Button>
            ) : (
              <div className="text-center py-2">
                <span className="text-sm text-muted-foreground">Awaiting intake</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Intake Status</span>
            </div>
            <div className="text-center py-2">
              <span className="text-sm text-muted-foreground">No intake started</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}