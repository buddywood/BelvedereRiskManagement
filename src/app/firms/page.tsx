import { permanentRedirect } from "next/navigation";

/** Legacy /firms path — Advisors audience now lives at /advisors. */
export default function FirmsRedirectPage() {
  permanentRedirect("/advisors");
}
