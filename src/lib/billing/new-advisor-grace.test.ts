import { describe, expect, it } from "vitest";
import { newAdvisorGracePeriodEndsAt, newAdvisorPaidSignupDeadline } from "./new-advisor-grace";

describe("newAdvisorGracePeriodEndsAt", () => {
  it("returns 00:00 UTC on the following calendar date", () => {
    const from = new Date(Date.UTC(2026, 4, 2, 15, 30, 0));
    expect(newAdvisorGracePeriodEndsAt(from)).toEqual(new Date(Date.UTC(2026, 4, 3, 0, 0, 0, 0)));
  });

  it("rolls month boundaries", () => {
    const from = new Date(Date.UTC(2026, 0, 31, 8, 0, 0));
    expect(newAdvisorGracePeriodEndsAt(from)).toEqual(new Date(Date.UTC(2026, 1, 1, 0, 0, 0, 0)));
  });
});

describe("newAdvisorPaidSignupDeadline", () => {
  it("is 30 days after the reference instant", () => {
    const from = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
    const end = newAdvisorPaidSignupDeadline(from);
    expect(end.getTime() - from.getTime()).toBe(30 * 24 * 60 * 60 * 1000);
  });
});
