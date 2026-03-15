import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FamilyHouseholdMember } from "@/lib/family/types";

interface HouseholdMemberListProps {
  members: FamilyHouseholdMember[];
}

export function HouseholdMemberList({ members }: HouseholdMemberListProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <Card className="bg-background/60">
      <CardContent className="pt-5 sm:pt-6">
        <p className="editorial-kicker">Household Members</p>
        <div className="mt-4 space-y-3">
          {members.map((member, index) => (
            <div key={index} className="space-y-2">
              <div>
                <p className="font-medium">{member.fullName}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.relationship.toLowerCase().replace(/_/g, ' ')}
                </p>
              </div>
              {member.governanceRoles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.governanceRoles.map((role, roleIndex) => (
                    <Badge key={roleIndex} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}