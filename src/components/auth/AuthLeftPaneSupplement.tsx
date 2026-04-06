"use client";

import { usePathname } from "next/navigation";

export function AuthLeftPaneSupplement() {
  const pathname = usePathname();
  if (pathname !== "/request-review") {
    return null;
  }

  return (
    <div className="max-w-xl space-y-6 border-t border-border/50 pt-8">
      <div className="space-y-2">
        <p className="editorial-kicker">Who this is for</p>
        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          Individuals and households who want a full, structured risk
          assessment—across Family Governance, Cyber Risk, Identity Risk, and
          whichever pillars apply to you—rather than a generic online
          questionnaire.
        </p>
      </div>
      <div className="space-y-2">
        <p className="editorial-kicker">What this form does</p>
        <p className="text-base leading-7 text-muted-foreground sm:text-lg">
          You are starting a private conversation with Akili Risk Intelligence,
          not the full intake. We will confirm what you need, explain how
          assessments work for one or more pillars, and help you choose scope
          before anything formal begins.
        </p>
      </div>
      <ul className="space-y-4 text-sm leading-6 text-muted-foreground sm:text-base">
        <li className="flex gap-3">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/55"
            aria-hidden
          />
          <span>
            <span className="font-medium text-foreground">Discreet by design.</span>{" "}
            Your details are used to respond to you personally, not for bulk
            marketing lists.
          </span>
        </li>
        <li className="flex gap-3">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/55"
            aria-hidden
          />
          <span>
            <span className="font-medium text-foreground">Your pace.</span>{" "}
            The full intake and pillar deep-dives begin only when you decide to
            move forward.
          </span>
        </li>
        <li className="flex gap-3">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/55"
            aria-hidden
          />
          <span>
            <span className="font-medium text-foreground">A direct line.</span>{" "}
            Expect follow-up at the email you provide from our team—no anonymous
            queues.
          </span>
        </li>
      </ul>
    </div>
  );
}
