import { getHouseholdMembers } from '@/lib/actions/profile-actions';
import { ProfilesClient } from './ProfilesClient';

export default async function ProfilesPage() {
  const result = await getHouseholdMembers();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Household Members</h1>
          <p className="text-muted-foreground">Manage your family members and their governance roles</p>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load household members: {result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Household Members</h1>
        <p className="text-muted-foreground">Manage your family members and their governance roles</p>
      </div>

      <ProfilesClient initialMembers={result.members || []} />
    </div>
  );
}