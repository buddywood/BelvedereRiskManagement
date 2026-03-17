'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { resendInvitationAction, expireInvitationAction } from '@/lib/actions/invitations';
import { InvitationWithDetails } from '@/lib/invitations/types';
import { InvitationStatus } from '@prisma/client';
import { Loader2, RotateCcw, X } from 'lucide-react';

interface InvitationTableProps {
  invitations: InvitationWithDetails[];
}

export function InvitationTable({ invitations }: InvitationTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  const handleResend = async (invitation: InvitationWithDetails) => {
    if (processingId) return;

    setProcessingId(invitation.id);

    try {
      const result = await resendInvitationAction(invitation.id);

      if (result.success) {
        toast.success('Invitation resent successfully');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to resend invitation');
      console.error('Error resending invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExpire = async (invitation: InvitationWithDetails) => {
    if (processingId) return;

    const confirmed = window.confirm(
      'Are you sure you want to expire this invitation? The client will no longer be able to use this link to register.'
    );

    if (!confirmed) return;

    setProcessingId(invitation.id);

    try {
      const result = await expireInvitationAction(invitation.id);

      if (result.success) {
        toast.success('Invitation expired successfully');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to expire invitation');
      console.error('Error expiring invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const canResend = (invitation: InvitationWithDetails) => {
    return (
      (invitation.status === InvitationStatus.SENT || invitation.status === InvitationStatus.EXPIRED) &&
      invitation.resendCount < 3
    );
  };

  const canExpire = (invitation: InvitationWithDetails) => {
    return invitation.status === InvitationStatus.SENT || invitation.status === InvitationStatus.OPENED;
  };

  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="space-y-3">
          <p className="text-muted-foreground">No invitations yet.</p>
          <p className="text-sm text-muted-foreground">
            Send your first invitation above to get started.
          </p>
        </div>
      </div>
    );
  }

  // Sort by date descending (newest first)
  const sortedInvitations = [...invitations].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Client</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Sent</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Expires</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedInvitations.map((invitation) => (
              <tr key={invitation.id} className="hover:bg-muted/30">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">
                    {invitation.clientName || 'Not provided'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">
                    {invitation.prefillEmail}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <InvitationStatusBadge status={invitation.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-muted-foreground">
                    {invitation.expiresAt ? format(new Date(invitation.expiresAt), 'MMM d, yyyy') : 'Never'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {canResend(invitation) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(invitation)}
                        disabled={processingId === invitation.id}
                      >
                        {processingId === invitation.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                        Resend
                      </Button>
                    )}
                    {canExpire(invitation) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExpire(invitation)}
                        disabled={processingId === invitation.id}
                      >
                        {processingId === invitation.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        Expire
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}