import { BillingDashboard } from "@/components/advisor/billing/BillingDashboard";
import { getBillingHistory, getSubscriptionDetails } from "@/lib/actions/billing";
import { fetchPlanPricesForUi } from "@/lib/billing/plan-price-display";
import { emptyPlanPricesForUi } from "@/lib/billing/plan-prices-ui";

export default async function AdvisorBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const sp = await searchParams;
  const checkout =
    sp.checkout === "success" ? "success" : sp.checkout === "cancel" ? "cancel" : null;

  const billingEnabled = process.env.ENABLE_BILLING_FEATURES !== "false";

  const [subRes, invRes, planPrices] = await Promise.all([
    getSubscriptionDetails(),
    getBillingHistory(),
    billingEnabled ? fetchPlanPricesForUi() : Promise.resolve(emptyPlanPricesForUi()),
  ]);

  if (!subRes.success) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {subRes.error}
      </div>
    );
  }

  const invoices = invRes.success ? invRes.data : [];

  return (
    <BillingDashboard
      initialSubscription={subRes.data}
      initialInvoices={invoices}
      checkoutNotice={checkout}
      billingEnabled={billingEnabled}
      planPrices={planPrices}
    />
  );
}
