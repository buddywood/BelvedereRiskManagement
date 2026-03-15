'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateAdvisorPersonalDetails } from '@/lib/actions/personal-profile';
import type { AdvisorPersonalDetailsFormData } from '@/lib/schemas/profile';

interface AdvisorPersonalDetailsFormProps {
  initialData: AdvisorPersonalDetailsFormData;
}

export function AdvisorPersonalDetailsForm({ initialData }: AdvisorPersonalDetailsFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialData.firstName ?? '');
  const [lastName, setLastName] = useState(initialData.lastName ?? '');
  const [phone, setPhone] = useState(initialData.phone ?? '');
  const [jobTitle, setJobTitle] = useState(initialData.jobTitle ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateAdvisorPersonalDetails({ firstName, lastName, phone, jobTitle });
      if (result.success) {
        toast.success('Personal details updated');
        router.refresh();
      } else {
        toast.error(result.error ?? 'Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="advisor-firstName">First name</Label>
          <Input
            id="advisor-firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            disabled={isSubmitting}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advisor-lastName">Last name</Label>
          <Input
            id="advisor-lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={isSubmitting}
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advisor-phone">Phone</Label>
          <Input
            id="advisor-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advisor-jobTitle">Job title</Label>
          <Input
            id="advisor-jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Advisor"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save personal details'}
      </Button>
    </form>
  );
}
