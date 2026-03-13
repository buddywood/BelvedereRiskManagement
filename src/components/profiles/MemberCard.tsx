'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RELATIONSHIP_LABELS, GOVERNANCE_ROLE_LABELS } from '@/lib/schemas/profile';
import {
  BriefcaseBusiness,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';

// Using Prisma type from the database
type HouseholdMember = {
  id: string;
  fullName: string;
  age: number | null;
  occupation: string | null;
  phone: string | null;
  email: string | null;
  relationship: keyof typeof RELATIONSHIP_LABELS;
  governanceRoles: (keyof typeof GOVERNANCE_ROLE_LABELS)[];
  isResident: boolean;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

interface MemberCardProps {
  member: HouseholdMember;
  onEdit: (member: HouseholdMember) => void;
  onDelete: (id: string) => void;
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const contactItems = [
    member.phone
      ? { label: 'Phone', value: member.phone, icon: Phone }
      : null,
    member.email
      ? { label: 'Email', value: member.email, icon: Mail }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    icon: typeof Phone;
  }>;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${member.fullName}?`)) {
      onDelete(member.id);
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      <CardHeader className="space-y-4 border-b section-divider pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="editorial-kicker">Household Profile</p>
              <CardTitle className="text-xl sm:text-2xl">{member.fullName}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-background/75">
                {RELATIONSHIP_LABELS[member.relationship]}
              </Badge>
              <Badge variant={member.isResident ? 'secondary' : 'info'} className="bg-background/75">
                {member.isResident ? 'Lives In Household' : 'Extended Family'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onEdit(member)}
              className="shrink-0 bg-background/80"
              aria-label={`Edit ${member.fullName}`}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              className="shrink-0 text-destructive hover:text-destructive"
              aria-label={`Delete ${member.fullName}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        {(member.age || member.occupation) && (
          <div className="flex flex-wrap gap-2">
            {member.age ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground">
                <UserRound className="size-3.5" />
                <span className="font-medium text-foreground">{member.age}</span>
                <span>years old</span>
              </div>
            ) : null}
            {member.occupation ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground">
                <BriefcaseBusiness className="size-3.5" />
                <span className="font-medium text-foreground">{member.occupation}</span>
              </div>
            ) : null}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pt-5">
        {contactItems.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contact
            </p>
            <div className="grid gap-2 rounded-[1.25rem] border border-border/70 bg-background/70 p-3 text-sm">
              {contactItems.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/65 px-3 py-2.5"
                >
                  <Icon className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="break-words font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {member.governanceRoles.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Governance Roles
            </div>
            <div className="flex flex-wrap gap-2">
              {member.governanceRoles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {GOVERNANCE_ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-border/80 bg-background/55 p-4 text-sm text-muted-foreground">
            No governance roles have been assigned yet.
          </div>
        )}

        {member.notes ? (
          <div className="mt-auto space-y-2 rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Notes
            </p>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{member.notes}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}