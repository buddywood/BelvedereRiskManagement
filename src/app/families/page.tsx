import { permanentRedirect } from "next/navigation";

/** Legacy /families path — merged into Advisors (family offices, RIAs, BDs). */
export default function FamiliesRedirectPage() {
  permanentRedirect("/advisors");
}
