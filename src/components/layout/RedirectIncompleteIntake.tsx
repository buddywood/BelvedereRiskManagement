"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface RedirectIncompleteIntakeProps {
  restrictNavToIntake: boolean;
}

export function RedirectIncompleteIntake({ restrictNavToIntake }: RedirectIncompleteIntakeProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!restrictNavToIntake) return;
    if (pathname === "/intake" || pathname.startsWith("/intake/")) return;
    router.replace("/intake");
  }, [restrictNavToIntake, pathname, router]);

  return null;
}
