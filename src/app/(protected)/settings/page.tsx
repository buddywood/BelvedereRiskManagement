import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      mfaEnabled: true,
      mfaRecoveryCodes: true,
    },
  });

  if (!user) {
    redirect("/signin");
  }

  const recoveryCodesRemaining = user.mfaRecoveryCodes
    ? (user.mfaRecoveryCodes as string[]).length
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      {/* Account Information */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Two-Factor Authentication */}
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

        {user.mfaEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
              <p className="text-sm text-gray-600">
                Your account is protected with two-factor authentication
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded border">
              <p className="text-sm font-medium mb-1">Recovery Codes</p>
              <p className="text-sm text-gray-600">
                {recoveryCodesRemaining} recovery code
                {recoveryCodesRemaining !== 1 ? "s" : ""} remaining
              </p>
              {recoveryCodesRemaining <= 2 && (
                <p className="text-sm text-orange-600 mt-2">
                  Warning: You&apos;re running low on recovery codes. Consider generating new ones.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                title="Regenerate recovery codes feature not yet implemented"
              >
                Regenerate Recovery Codes
              </button>
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                title="Disable MFA feature not yet implemented"
              >
                Disable MFA
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
              <p className="text-sm text-gray-600">
                Two-factor authentication is not enabled
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-900 mb-2">
                <strong>Recommended:</strong> Enable two-factor authentication to add an extra layer of security to your account.
              </p>
              <p className="text-sm text-blue-800">
                You&apos;ll need an authenticator app like Google Authenticator, Authy, or 1Password.
              </p>
            </div>

            <a
              href="/mfa/setup"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enable Two-Factor Authentication
            </a>
          </div>
        )}
      </section>

      {/* Security */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Security</h2>
        <div className="space-y-3">
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
            title="Change password feature not yet implemented"
          >
            Change Password
          </button>
        </div>
      </section>
    </div>
  );
}
