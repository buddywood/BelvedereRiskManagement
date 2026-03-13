'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GOVERNANCE_ROLE_LABELS } from '@/lib/schemas/profile';

type GovernanceRole = keyof typeof GOVERNANCE_ROLE_LABELS;

interface RoleSelectorProps {
  value: GovernanceRole[];
  onChange: (roles: GovernanceRole[]) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const roles = Object.keys(GOVERNANCE_ROLE_LABELS) as GovernanceRole[];

  const toggleRole = (role: GovernanceRole) => {
    if (value.includes(role)) {
      onChange(value.filter((r) => r !== role));
    } else {
      onChange([...value, role]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {roles.map((role) => {
          const isSelected = value.includes(role);
          return (
            <Button
              key={role}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleRole(role)}
              className="h-auto min-h-11 justify-start px-3 py-3 text-left text-xs leading-5"
            >
              {GOVERNANCE_ROLE_LABELS[role]}
            </Button>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className="rounded-[1.25rem] border border-border/70 bg-background/70 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Selected Roles
          </p>
          <div className="flex flex-wrap gap-2">
          {value.map((role) => (
            <Badge key={role} variant="secondary">
              {GOVERNANCE_ROLE_LABELS[role]}
            </Badge>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}