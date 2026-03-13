'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MemberCard } from '@/components/profiles/MemberCard';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { createHouseholdMember, updateHouseholdMember, deleteHouseholdMember } from '@/lib/actions/profile-actions';
import { RELATIONSHIP_LABELS, GOVERNANCE_ROLE_LABELS } from '@/lib/schemas/profile';
import { Plus } from 'lucide-react';

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

type FormData = {
  fullName: string;
  age?: number;
  occupation?: string;
  phone?: string;
  email?: string;
  relationship: keyof typeof RELATIONSHIP_LABELS;
  governanceRoles: (keyof typeof GOVERNANCE_ROLE_LABELS)[];
  isResident: boolean;
  notes?: string;
};

interface ProfilesClientProps {
  initialMembers: HouseholdMember[];
}

export function ProfilesClient({ initialMembers }: ProfilesClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
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
    } catch (error) {
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
  });

  if (showForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {editingMember ? 'Edit Household Member' : 'Add Household Member'}
              </h2>
              <ProfileForm
                defaultValues={editingMember ? getDefaultValues(editingMember) : undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (initialMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center">
            <Plus className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No household members yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Get started by adding your first household member. Include their contact information,
              relationship to you, and any governance roles they may have.
            </p>
          </div>
          <Button onClick={handleAddMember} size="lg">
            <Plus className="size-4 mr-2" />
            Add Your First Member
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {initialMembers.length} {initialMembers.length === 1 ? 'member' : 'members'} in your household
        </p>
        <Button onClick={handleAddMember}>
          <Plus className="size-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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