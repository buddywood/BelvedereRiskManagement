export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="page-shell">
        <div className="hero-surface grid min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="app-grid order-2 flex flex-col justify-between gap-8 border-t section-divider px-6 py-6 sm:px-8 lg:order-1 lg:border-t-0 lg:border-r lg:px-12 lg:py-12">
            <div className="space-y-6">
              <p className="editorial-kicker">Belvedere Risk Management</p>
              <div className="max-w-xl space-y-4">
                <h1 className="text-4xl font-semibold leading-none text-balance sm:text-5xl lg:text-6xl">
                  A calmer, more intentional way to assess governance risk.
                </h1>
                <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                  Purpose-built for high-trust relationships, with a visual
                  language that feels discreet, editorial, and modern on every screen.
                </p>
              </div>
            </div>

            <div className="hidden gap-4 sm:grid-cols-3 lg:grid">
              <div className="rounded-[1.5rem] border section-divider bg-background/55 p-5">
                <p className="text-sm font-semibold">Guided</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Step-by-step flows designed for focused assessment work.
                </p>
              </div>
              <div className="rounded-[1.5rem] border section-divider bg-background/55 p-5">
                <p className="text-sm font-semibold">Responsive</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Thoughtful layouts that scale from mobile review to desktop analysis.
                </p>
              </div>
              <div className="rounded-[1.5rem] border section-divider bg-background/55 p-5">
                <p className="text-sm font-semibold">Secure</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Authentication and MFA experiences aligned with the brand tone.
                </p>
              </div>
            </div>
          </section>

          <section className="order-1 flex items-center justify-center px-4 py-6 sm:px-8 lg:order-2 lg:px-12">
            <div className="w-full max-w-xl">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
