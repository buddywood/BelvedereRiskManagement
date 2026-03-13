'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RELATIONSHIP_LABELS, GOVERNANCE_ROLE_LABELS } from '@/lib/schemas/profile';
import { Pencil, Trash2 } from 'lucide-react';

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
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${member.fullName}?`)) {
      onDelete(member.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{member.fullName}</h3>
            <Badge variant="outline" className="mt-1">
              {RELATIONSHIP_LABELS[member.relationship]}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(member)}
              className="shrink-0"
            >
              <Pencil className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDelete}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {(member.age || member.occupation) && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            {member.age && <span>Age: {member.age}</span>}
            {member.occupation && <span>{member.occupation}</span>}
          </div>
        )}

        {(member.phone || member.email) && (
          <div className="space-y-1 text-sm">
            {member.phone && (
              <div className="text-muted-foreground">
                Phone: <span className="text-foreground">{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="text-muted-foreground">
                Email: <span className="text-foreground">{member.email}</span>
              </div>
            )}
          </div>
        )}

        {member.governanceRoles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Governance Roles</p>
            <div className="flex flex-wrap gap-1">
              {member.governanceRoles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {GOVERNANCE_ROLE_LABELS[role]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!member.isResident && (
          <Badge variant="info" className="text-xs">
            Extended Family
          </Badge>
        )}

        {member.notes && (
          <div className="text-sm text-muted-foreground">
            <p className="text-xs font-medium mb-1">Notes</p>
            <p className="text-xs">{member.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}