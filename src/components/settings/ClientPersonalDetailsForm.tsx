'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressSearch, type AddressSuggestion } from '@/components/settings/AddressSearch';
import { updateClientPersonalDetails } from '@/lib/actions/personal-profile';
import type { ClientPersonalDetailsFormData } from '@/lib/schemas/profile';

interface ClientPersonalDetailsFormProps {
  initialData: ClientPersonalDetailsFormData;
}

export function ClientPersonalDetailsForm({ initialData }: ClientPersonalDetailsFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialData.firstName ?? '');
  const [lastName, setLastName] = useState(initialData.lastName ?? '');
  const [phone, setPhone] = useState(initialData.phone ?? '');
  const [addressLine1, setAddressLine1] = useState(initialData.addressLine1 ?? '');
  const [addressLine2, setAddressLine2] = useState(initialData.addressLine2 ?? '');
  const [city, setCity] = useState(initialData.city ?? '');
  const [state, setState] = useState(initialData.state ?? '');
  const [postalCode, setPostalCode] = useState(initialData.postalCode ?? '');
  const [country, setCountry] = useState(initialData.country ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData.dateOfBirth ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressSelect = useCallback((s: AddressSuggestion) => {
    setAddressLine1(s.addressLine1);
    setCity(s.city);
    setState(s.state);
    setPostalCode(s.postalCode);
    setCountry(s.country);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateClientPersonalDetails({
        firstName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        dateOfBirth,
      });
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
          <Label htmlFor="client-firstName">First name</Label>
          <Input
            id="client-firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            disabled={isSubmitting}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-lastName">Last name</Label>
          <Input
            id="client-lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={isSubmitting}
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-phone">Phone</Label>
          <Input
            id="client-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="client-dob">Date of birth</Label>
          <Input
            id="client-dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <AddressSearch onSelect={handleAddressSelect} disabled={isSubmitting} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="client-address1">Address line 1</Label>
          <Input
            id="client-address1"
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street address"
            disabled={isSubmitting}
            autoComplete="address-line1"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="client-address2">Address line 2</Label>
          <Input
            id="client-address2"
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apt, suite, etc. (optional)"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-city">City</Label>
          <Input
            id="client-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isSubmitting}
            autoComplete="address-level2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-state">State / Province</Label>
          <Input
            id="client-state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            disabled={isSubmitting}
            autoComplete="address-level1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-postal">Postal code</Label>
          <Input
            id="client-postal"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            disabled={isSubmitting}
            autoComplete="postal-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-country">Country</Label>
          <Input
            id="client-country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            disabled={isSubmitting}
            autoComplete="country-name"
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save personal details'}
      </Button>
    </form>
  );
}
