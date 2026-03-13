import { useQuery } from '@tanstack/react-query';
import { getHouseholdMembers } from '@/lib/actions/profile-actions';
import type { HouseholdProfile } from '@/lib/assessment/personalization';

export function useHouseholdProfile() {
  const query = useQuery({
    queryKey: ['household-profile'],
    queryFn: async () => {
      const result = await getHouseholdMembers();
      if (!result.success || !result.members || result.members.length === 0) {
        return null;
      }
      const profile: HouseholdProfile = {
        members: result.members.map(m => ({
          id: m.id,
          fullName: m.fullName,
          age: m.age,
          relationship: m.relationship,
          governanceRoles: m.governanceRoles,
          isResident: m.isResident,
        })),
      };
      return profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes — profile rarely changes during assessment
    retry: 1,
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}