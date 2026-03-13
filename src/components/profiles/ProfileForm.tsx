'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RoleSelector } from './RoleSelector';
import { householdMemberSchema, RELATIONSHIP_LABELS, GOVERNANCE_ROLE_LABELS, type HouseholdMemberFormData } from '@/lib/schemas/profile';

type GovernanceRole = keyof typeof GOVERNANCE_ROLE_LABELS;

// Create a form-compatible type that doesn't rely on Zod defaults
type FormData = {
  fullName: string;
  age?: number;
  occupation?: string;
  phone?: string;
  email?: string;
  relationship: keyof typeof RELATIONSHIP_LABELS;
  governanceRoles: GovernanceRole[];
  isResident: boolean;
  notes?: string;
};

interface ProfileFormProps {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProfileForm({ defaultValues, onSubmit, onCancel, isSubmitting }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(householdMemberSchema) as any,
    defaultValues: {
      fullName: defaultValues?.fullName || '',
      age: defaultValues?.age,
      occupation: defaultValues?.occupation || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      relationship: defaultValues?.relationship || 'SPOUSE',
      governanceRoles: defaultValues?.governanceRoles || [],
      isResident: defaultValues?.isResident ?? true,
      notes: defaultValues?.notes || '',
    },
  });

  const relationships = Object.entries(RELATIONSHIP_LABELS);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4">
        {/* Full Name - full width */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name *
          </label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="Enter full name"
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        {/* Age and Occupation - half width each */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="age" className="text-sm font-medium">
              Age
            </label>
            <Input
              id="age"
              type="number"
              {...register('age', { valueAsNumber: true })}
              placeholder="Enter age"
              min="0"
              max="150"
              aria-invalid={!!errors.age}
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="occupation" className="text-sm font-medium">
              Occupation
            </label>
            <Input
              id="occupation"
              {...register('occupation')}
              placeholder="Enter occupation"
              aria-invalid={!!errors.occupation}
            />
            {errors.occupation && (
              <p className="text-sm text-destructive">{errors.occupation.message}</p>
            )}
          </div>
        </div>

        {/* Phone and Email - half width each */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone
            </label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter phone number"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Relationship - full width */}
        <div className="space-y-2">
          <label htmlFor="relationship" className="text-sm font-medium">
            Relationship *
          </label>
          <select
            id="relationship"
            {...register('relationship')}
            className="h-11 w-full min-w-0 rounded-xl border border-input bg-card/80 px-4 py-2 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition-[color,box-shadow,border-color,background-color] outline-none focus-visible:border-ring focus-visible:bg-background focus-visible:ring-ring/35 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive md:text-sm"
            aria-invalid={!!errors.relationship}
          >
            {relationships.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p className="text-sm text-destructive">{errors.relationship.message}</p>
          )}
        </div>

        {/* Is Resident - full width */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('isResident')}
              className="size-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <span className="text-sm font-medium">Lives in household</span>
          </label>
          <p className="text-xs text-muted-foreground">
            Unchecked indicates extended family member
          </p>
        </div>

        {/* Governance Roles - full width */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Governance Roles</label>
          <Controller
            name="governanceRoles"
            control={control}
            render={({ field }) => (
              <RoleSelector
                value={field.value as GovernanceRole[]}
                onChange={(roles: GovernanceRole[]) => field.onChange(roles)}
              />
            )}
          />
          {errors.governanceRoles && (
            <p className="text-sm text-destructive">{errors.governanceRoles.message}</p>
          )}
        </div>

        {/* Notes - full width */}
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about this household member"
            aria-invalid={!!errors.notes}
          />
          {errors.notes && (
            <p className="text-sm text-destructive">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : defaultValues ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}