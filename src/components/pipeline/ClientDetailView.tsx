"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, User, Mail, Calendar, ExternalLink, BarChart3, FileText, CheckCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { DocumentRequirements } from "./DocumentRequirements";
import { getStageLabel } from "@/lib/pipeline/status";
import type { ClientDetail } from "@/lib/pipeline/types";

interface ClientDetailViewProps {
  detail: ClientDetail;
}

function getStageBadgeVariant(stage: any) {
  switch (stage) {
    case 'INVITED':
    case 'REGISTERED':
      return 'info' as const;
    case 'INTAKE_IN_PROGRESS':
    case 'ASSESSMENT_IN_PROGRESS':
    case 'DOCUMENTS_REQUIRED':
      return 'warning' as const;
    case 'INTAKE_COMPLETE':
    case 'ASSESSMENT_COMPLETE':
    case 'COMPLETE':
      return 'success' as const;
    default:
      return 'outline' as const;
  }
}

function getRiskLevelColor(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-amber-600 bg-amber-50';
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'critical':
      return 'text-red-800 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function ClientDetailView({ detail }: ClientDetailViewProps) {
  const { client, timeline, documentRequirements, intakeDetails, assessmentDetails } = detail;
  const displayName = client.name || 'Unnamed Client';

  return (
    <div className="container mx-auto py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/advisor/pipeline"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pipeline
        </Link>
      </div>

      {/* Client Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Assigned {format(client.assignedAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-2">
            <Badge variant={getStageBadgeVariant(client.stage)} className="text-sm">
              {getStageLabel(client.stage)}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Last activity {formatDistanceToNow(client.lastActivity, { addSuffix: true })}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Workflow Progress</span>
            <span className="font-medium">{client.progress}%</span>
          </div>
          <Progress value={client.progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Workflow Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowTimeline events={timeline} currentStage={client.stage} />
            </CardContent>
          </Card>

          {/* Intake Summary */}
          {intakeDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Intake Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={intakeDetails.status === 'COMPLETED' ? 'success' : 'secondary'}>
                      {intakeDetails.status === 'COMPLETED' ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Progress</p>
                    <p className="text-lg font-semibold">
                      {intakeDetails.responseCount}/{intakeDetails.totalQuestions}
                    </p>
                  </div>
                  {intakeDetails.submittedAt && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                      <p className="text-sm">{format(intakeDetails.submittedAt, 'MMM d, yyyy')}</p>
                    </div>
                  )}
                  {intakeDetails.submittedAt && intakeDetails.responseCount > 0 && (
                    <div>
                      <Link
                        href={`/advisor/review/${client.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Review Responses
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Summary */}
          {assessmentDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge variant={assessmentDetails.status === 'COMPLETED' ? 'success' : 'secondary'}>
                        {assessmentDetails.status === 'COMPLETED' ? 'Complete' : 'In Progress'}
                      </Badge>
                    </div>
                    {assessmentDetails.score !== null && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                        <p className="text-lg font-semibold">{assessmentDetails.score}</p>
                      </div>
                    )}
                    {assessmentDetails.riskLevel && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                        <span className={`text-sm px-2 py-1 rounded-full font-medium ${getRiskLevelColor(assessmentDetails.riskLevel)}`}>
                          {assessmentDetails.riskLevel}
                        </span>
                      </div>
                    )}
                    {assessmentDetails.completedAt && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-sm">{format(assessmentDetails.completedAt, 'MMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>

                  {/* Pillar Scores */}
                  {assessmentDetails.pillarScores.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Risk Pillars</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {assessmentDetails.pillarScores.map((pillar) => (
                          <div key={pillar.pillar} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{pillar.pillar}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getRiskLevelColor(pillar.riskLevel)}`}>
                                {pillar.riskLevel}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{pillar.score}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assessmentDetails.completedAt && (
                    <div className="pt-2">
                      <Link
                        href={`/advisor/analytics/${client.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <BarChart3 className="w-3 h-3" />
                        View Full Analytics
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Document Requirements */}
          <DocumentRequirements clientId={client.id} requirements={documentRequirements} />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/advisor/pipeline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Pipeline
                </Link>
              </Button>

              {assessmentDetails?.completedAt && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/advisor/analytics/${client.id}`}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Client Analytics
                  </Link>
                </Button>
              )}

              {intakeDetails?.submittedAt && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/advisor/review/${client.id}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Review Intake
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}