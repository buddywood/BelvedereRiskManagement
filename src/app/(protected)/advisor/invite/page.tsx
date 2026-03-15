import { redirect } from "next/navigation";

/**
 * Legacy route: redirect to the full invitation management UI.
 */
export default function AdvisorInvitePage() {
  redirect("/advisor/invitations");
}
