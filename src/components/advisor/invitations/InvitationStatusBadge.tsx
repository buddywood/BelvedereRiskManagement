'use client';

import { Badge } from "@/components/ui/badge";
import { InvitationStatus } from "@prisma/client";

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
}

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  const statusConfig = {
    SENT: {
      variant: "info" as const,
      text: "Sent",
    },
    OPENED: {
      variant: "warning" as const,
      text: "Opened",
    },
    REGISTERED: {
      variant: "success" as const,
      text: "Registered",
    },
    EXPIRED: {
      variant: "outline" as const,
      text: "Expired",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant}>
      {config.text}
    </Badge>
  );
}