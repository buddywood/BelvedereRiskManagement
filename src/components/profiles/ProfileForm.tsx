'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RoleSelector } from './RoleSelector';
import { householdMemberSchema, HouseholdMemberFormData, RELATIONSHIP_LABELS, GOVERNANCE_ROLE_LABELS } from '@/lib/schemas/profile';

type GovernanceRole = keyof typeof GOVERNANCE_ROLE_LABELS;

type FormData = HouseholdMemberFormData;

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
    resolver: zodResolver(householdMemberSchema),
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
      shareNameAndContactWithAdvisor: defaultValues?.shareNameAndContactWithAdvisor ?? true,
    },
  });

  const relationships = Object.entries(RELATIONSHIP_LABELS);
  const fieldLabelClassName = 'text-sm font-semibold text-foreground';
  const fieldHintClassName = 'text-xs leading-5 text-muted-foreground';
  const errorClassName = 'text-sm text-destructive';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Required fields marked with *</Badge>
            <Badge variant="secondary">Used for governance planning</Badge>
          </div>
          <h3 className="text-xl font-semibold tracking-[-0.03em]">Identity & context</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Start with the core profile details that help place this person inside your household
            structure and decision-making network.
          </p>
        </div>

        <div className="grid gap-5">
          <div className="space-y-2">
            <label htmlFor="fullName" className={fieldLabelClassName}>
              Full Name *
            </label>
            <p className={fieldHintClassName}>
              Use the member&apos;s full name as it would appear in family records.
            </p>
            <Input
              id="fullName"
              {...register('fullName')}
              placeholder="Enter full name"
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <p className={errorClassName}>{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="age" className={fieldLabelClassName}>
                Age
              </label>
              <p className={fieldHintClassName}>Optional, but useful for context and succession planning.</p>
              <Input
                id="age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                placeholder="Enter age"
                min="0"
                max="150"
                aria-invalid={!!errors.age}
              />
              {errors.age && <p className={errorClassName}>{errors.age.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="occupation" className={fieldLabelClassName}>
                Occupation
              </label>
              <p className={fieldHintClassName}>Add a current role or profession if it informs governance duties.</p>
              <Input
                id="occupation"
                {...register('occupation')}
                placeholder="Enter occupation"
                aria-invalid={!!errors.occupation}
              />
              {errors.occupation && (
                <p className={errorClassName}>{errors.occupation.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="relationship" className={fieldLabelClassName}>
              Relationship *
            </label>
            <p className={fieldHintClassName}>
              Select how this person is connected to the household decision-makers.
            </p>
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="relationship" aria-invalid={!!errors.relationship}>
                    <SelectValue placeholder="Choose relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.relationship && (
              <p className={errorClassName}>{errors.relationship.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-border/70 bg-background/65 p-5 sm:p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-[-0.03em]">Contact details</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Include the best channels for reaching this person when planning, coordinating, or
            sharing follow-up actions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="phone" className={fieldLabelClassName}>
              Phone
            </label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter phone number"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className={errorClassName}>{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className={fieldLabelClassName}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className={errorClassName}>{errors.email.message}</p>}
          </div>
        </div>

        <Controller
          name="shareNameAndContactWithAdvisor"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
              <Checkbox
                checked={field.value}
                onCheckedChange={(state) => field.onChange(state === true)}
                className="mt-1"
                aria-describedby="share-advisor-hint"
              />
              <span className="min-w-0 space-y-1">
                <span className="block text-sm font-semibold text-foreground">
                  Share name and contact with my advisor
                </span>
                <span id="share-advisor-hint" className="block text-xs leading-5 text-muted-foreground">
                  When off, your advisor still sees relationship, residency, governance roles, and age so
                  assessments stay accurate. Name, phone, email, occupation, and notes stay private to you.
                </span>
              </span>
            </label>
          )}
        />
        {errors.shareNameAndContactWithAdvisor && (
          <p className={errorClassName}>{errors.shareNameAndContactWithAdvisor.message}</p>
        )}
      </section>

      <section className="space-y-5 rounded-[1.5rem] border border-border/70 bg-background/65 p-5 sm:p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-[-0.03em]">Governance participation</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Document how this person participates in family leadership, advisory conversations, or
            future transition planning.
          </p>
        </div>

        <div className="space-y-2">
          <label className={fieldLabelClassName}>Residency</label>
          <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4">
            <input
              type="checkbox"
              {...register('isResident')}
              className="mt-1 size-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-foreground">Lives in household</span>
              <span className="block text-xs leading-5 text-muted-foreground">
                Leave this checked for immediate household residents. Uncheck it for extended
                family or external participants.
              </span>
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <label className={fieldLabelClassName}>Governance Roles</label>
          <p className={fieldHintClassName}>
            Select every role that currently applies. You can update these as responsibilities
            evolve.
          </p>
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
            <p className={errorClassName}>{errors.governanceRoles.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className={fieldLabelClassName}>
            Notes
          </label>
          <p className={fieldHintClassName}>
            Add nuance that may help later with planning conversations or special circumstances.
          </p>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes about this household member"
            aria-invalid={!!errors.notes}
          />
          {errors.notes && <p className={errorClassName}>{errors.notes.message}</p>}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t section-divider pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Saving...' : defaultValues ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
}