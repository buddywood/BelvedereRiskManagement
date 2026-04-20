import { BriefcaseBusiness, Mail, Phone, UserRound, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AdvisorHouseholdMemberView } from "@/lib/profiles/advisor-household-view";
import { GOVERNANCE_ROLE_LABELS, RELATIONSHIP_LABELS } from "@/lib/schemas/profile";

function MemberCard({ member }: { member: AdvisorHouseholdMemberView }) {
  const contactItems = [
    member.phone ? { label: "Phone", value: member.phone, icon: Phone } : null,
    member.email ? { label: "Email", value: member.email, icon: Mail } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Phone }>;

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">{member.fullName}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-background/75 text-xs">
              {RELATIONSHIP_LABELS[member.relationship]}
            </Badge>
            <Badge variant={member.isResident ? "secondary" : "info"} className="text-xs">
              {member.isResident ? "Lives in household" : "Extended family"}
            </Badge>
            {!member.shareNameAndContactWithAdvisor ? (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-xs font-semibold uppercase tracking-wide text-amber-950 dark:text-amber-100"
              >
                Private
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {(member.age != null || member.occupation) && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {member.age != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1">
              <UserRound className="size-3.5 shrink-0" />
              <span className="font-medium text-foreground">{member.age}</span>
              <span>years</span>
            </span>
          ) : null}
          {member.occupation ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1">
              <BriefcaseBusiness className="size-3.5 shrink-0" />
              <span className="font-medium text-foreground">{member.occupation}</span>
            </span>
          ) : null}
        </div>
      )}

      {contactItems.length > 0 ? (
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
          <div className="grid gap-2">
            {contactItems.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-2 rounded-lg border border-border/50 bg-background/65 px-3 py-2">
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="break-words font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {member.governanceRoles.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Governance roles</p>
          <div className="flex flex-wrap gap-1.5">
            {member.governanceRoles.map((role) => (
              <Badge key={role} variant="secondary" className="text-xs">
                {GOVERNANCE_ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No governance roles assigned.</p>
      )}

      {member.notes ? (
        <div className="space-y-1 rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
          <p className="text-sm leading-relaxed text-foreground/90">{member.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

function DirectoryBody({ members }: { members: AdvisorHouseholdMemberView[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

interface AdvisorHouseholdDirectoryProps {
  members: AdvisorHouseholdMemberView[];
}

/**
 * Mobile: collapsible &lt;details&gt;. Desktop (lg+): always expanded in a card.
 * Anchor id for sidebar link: #household-directory
 */
export function AdvisorHouseholdDirectory({ members }: AdvisorHouseholdDirectoryProps) {
  if (members.length === 0) {
    return (
      <div
        id="household-directory"
        className="scroll-mt-28 rounded-lg border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground"
      >
        <p className="font-medium text-foreground">Household directory</p>
        <p className="mt-1">This client has not added household profiles yet.</p>
      </div>
    );
  }

  return (
    <div id="household-directory" className="scroll-mt-28 space-y-0">
      <details className="group rounded-lg border border-border/70 bg-card shadow-sm lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-2">
            <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">Household directory</span>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {members.length}
            </Badge>
          </span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground">Tap to expand</span>
        </summary>
        <div className="border-t border-border/60 p-4 pt-4">
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            Relationship, residency, roles, and age are always visible. Name, phone, email, occupation, and notes follow
            the client&apos;s sharing preferences.
          </p>
          <DirectoryBody members={members} />
        </div>
      </details>

      <div className="hidden space-y-4 rounded-lg border border-border/70 bg-card p-6 shadow-sm lg:block">
        <div className="flex flex-wrap items-center gap-2">
          <Users className="size-5 text-muted-foreground" aria-hidden />
          <h3 className="text-lg font-semibold tracking-tight">Household directory</h3>
          <Badge variant="outline">{members.length}</Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Relationship, residency, roles, and age are always visible. Name, phone, email, occupation, and notes follow the
          client&apos;s sharing preferences.
        </p>
        <DirectoryBody members={members} />
      </div>
    </div>
  );
}
