'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MemberCard } from '@/components/profiles/MemberCard';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import {
  createHouseholdMember,
  updateHouseholdMember,
  deleteHouseholdMember,
  setAllHouseholdMembersShareNameAndContactWithAdvisor,
} from '@/lib/actions/profile-actions';
import { HouseholdMemberFormData } from '@/lib/schemas/profile';
import { ArrowLeft, Plus, ShieldCheck, Users } from 'lucide-react';

// Using Prisma type from the database
type HouseholdMember = {
  id: string;
  fullName: string;
  age: number | null;
  occupation: string | null;
  phone: string | null;
  email: string | null;
  relationship: HouseholdMemberFormData['relationship'];
  governanceRoles: HouseholdMemberFormData['governanceRoles'];
  isResident: boolean;
  notes: string | null;
  shareNameAndContactWithAdvisor: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type FormData = HouseholdMemberFormData;

interface ProfilesClientProps {
  initialMembers: HouseholdMember[];
}

export function ProfilesClient({ initialMembers }: ProfilesClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkSharePending, startBulkShareTransition] = useTransition();
  const router = useRouter();
  const residentCount = initialMembers.filter((member) => member.isResident).length;
  const advisoryCount = initialMembers.filter((member) => member.governanceRoles.length > 0).length;
  const allShareNameWithAdvisor = initialMembers.every((m) => m.shareNameAndContactWithAdvisor);
  const noneShareNameWithAdvisor = initialMembers.every((m) => !m.shareNameAndContactWithAdvisor);
  const bulkShareChecked: boolean | 'indeterminate' = allShareNameWithAdvisor
    ? true
    : noneShareNameWithAdvisor
      ? false
      : 'indeterminate';

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: HouseholdMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (editingMember) {
        result = await updateHouseholdMember(editingMember.id, data);
      } else {
        result = await createHouseholdMember(data);
      }

      if (result.success) {
        toast.success(editingMember ? 'Member updated successfully' : 'Member added successfully');
        setShowForm(false);
        setEditingMember(null);
        router.refresh();
      } else {
        const errorMessage = result.error || 'An error occurred';
        toast.error(errorMessage);
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkShareWithAdvisor = (share: boolean) => {
    startBulkShareTransition(() => {
      void (async () => {
        const result = await setAllHouseholdMembersShareNameAndContactWithAdvisor(share);
        if (result.success) {
          toast.success(
            share
              ? 'All members now share name and contact with your advisor'
              : 'Name and contact are hidden from your advisor for all members (roles still visible)',
          );
          router.refresh();
        } else {
          toast.error(result.error || 'Could not update advisor visibility');
        }
      })();
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteHouseholdMember(id);
      if (result.success) {
        toast.success('Member deleted successfully');
        router.refresh();
      } else {
        const errorMessage = result.error || 'Failed to delete member';
        toast.error(errorMessage);
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  const getDefaultValues = (member: HouseholdMember): FormData => ({
    fullName: member.fullName,
    age: member.age || undefined,
    occupation: member.occupation || undefined,
    phone: member.phone || undefined,
    email: member.email || undefined,
    relationship: member.relationship,
    governanceRoles: member.governanceRoles,
    isResident: member.isResident,
    notes: member.notes || undefined,
    shareNameAndContactWithAdvisor: member.shareNameAndContactWithAdvisor,
  });

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-background/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="editorial-kicker">
              {editingMember ? 'Profile Revision' : 'New Household Profile'}
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {editingMember ? `Update ${editingMember.fullName}` : 'Add a new member profile'}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Capture relationship context, contact details, and governance responsibilities so
                your family operating model stays current.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleCancel} className="shrink-0">
            <ArrowLeft className="size-4" />
            Back to directory
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="space-y-4 border-b section-divider pb-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Governance-ready record</Badge>
              <Badge variant="secondary">Private household data</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl">
                {editingMember ? 'Refine the member profile' : 'Build the member profile'}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
                Include the information your team will need later for ownership transitions,
                family participation, and governance planning.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ProfileForm
              defaultValues={editingMember ? getDefaultValues(editingMember) : undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initialMembers.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="px-6 py-10 sm:px-8 sm:py-12">
          <div className="app-grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-secondary/85 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                  <Plus className="size-8" />
                </div>
                <div className="space-y-3">
                  <p className="editorial-kicker">Start The Directory</p>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
                    No household members have been added yet.
                  </h3>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Begin with the people who shape decisions, inherit responsibilities, or need to
                    stay informed as your governance structure evolves.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Family relationships</Badge>
                <Badge variant="secondary">Governance roles</Badge>
                <Badge variant="info">Contact context</Badge>
              </div>
              <Button onClick={handleAddMember} size="lg">
                <Plus className="size-4" />
                Add Your First Member
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-foreground" />
                  <p className="text-sm font-semibold text-foreground">What to capture</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Record relationship, residency, role, and contact details for the people who
                  matter in your family governance model.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-foreground" />
                  <p className="text-sm font-semibold text-foreground">Why it matters</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  This directory supports clearer succession planning, role mapping, and assessment
                  recommendations across the broader workspace.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hero-surface flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Badge variant="outline">
              {initialMembers.length} {initialMembers.length === 1 ? 'member' : 'members'}
            </Badge>
            <Badge variant="secondary">{residentCount} in household</Badge>
            <Badge variant="info">{advisoryCount} with governance roles</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-5 text-muted-foreground">
            Keep profiles current as roles, participants, and contact details change.
          </p>
        </div>
        <Button onClick={handleAddMember} size="lg" className="w-full sm:w-auto shrink-0">
          <Plus className="size-4" />
          Add Member
        </Button>
      </div>

      <Card className="overflow-hidden border-border/70 bg-background/65">
        <CardHeader className="pb-2 pt-5 sm:pt-6">
          <CardTitle className="text-lg">Advisor visibility</CardTitle>
          <CardDescription className="max-w-3xl text-sm leading-6">
            Control whether your advisor can see each person&apos;s name, phone, email, occupation, and notes.
            Relationship, residency, governance roles, and age stay visible for risk assessments when sharing is
            off.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-5 sm:pb-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
            <Checkbox
              checked={bulkShareChecked}
              onCheckedChange={(state) => handleBulkShareWithAdvisor(state === true)}
              disabled={isBulkSharePending}
              className="mt-1"
              aria-describedby="bulk-advisor-visibility-hint"
            />
            <span className="min-w-0 space-y-1">
              <span className="block text-sm font-semibold text-foreground">
                Share name and contact with my advisor for everyone
              </span>
              <span id="bulk-advisor-visibility-hint" className="block text-xs leading-5 text-muted-foreground">
                You can still change this per person when adding or editing a member.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {initialMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onEdit={handleEditMember}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}