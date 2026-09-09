import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import Badge from "../ui/Badge";
import { getServerT } from "@/i18n/server";

export default async function Hero() {
  const { t } = await getServerT("landing");

  const verdictRows = [
    { label: t("heroVerdictHook"), width: "86%" },
    { label: t("heroVerdictClarity"), width: "78%" },
    { label: t("heroVerdictPersuasion"), width: "72%" },
    { label: t("heroVerdictCta"), width: "64%" },
  ];

  return (
    <section className="overflow-hidden pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Copy */}
        <div className="text-center lg:text-start">
          <Badge variant="primary" className="animate-fade-up">
            {t("heroBadge")}
          </Badge>

          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            {t("heroTitle1")}
            <span className="block text-accent">{t("heroTitle2")}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-8 text-text-secondary lg:mx-0">
            {t("heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
            <GradientButton asChild>
              <Link href="/auth/signup">{t("heroStartFree")}</Link>
            </GradientButton>

            <GradientButton asChild variant="variant">
              <Link href="#how-it-works">{t("heroSeeHowItWorks")}</Link>
            </GradientButton>
          </div>

          <dl className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border text-center sm:grid-cols-3 sm:text-start">
            <div className="bg-surface px-6 py-6">
              <dt className="order-2 mt-1 text-sm text-text-muted">{t("heroStatScore")}</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-text-primary">100</dd>
            </div>

            <div className="bg-surface px-6 py-6">
              <dt className="order-2 mt-1 text-sm text-text-muted">{t("heroStatFrameworks")}</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-text-primary">5</dd>
            </div>

            <div className="bg-surface px-6 py-6">
              <dt className="order-2 mt-1 text-sm text-text-muted">{t("heroStatSupport")}</dt>
              <dd className="order-1 text-3xl font-bold tracking-tight text-text-primary">24/7</dd>
            </div>
          </dl>
        </div>

        {/* Product preview */}
        <div
          role="img"
          aria-label={t("heroPreviewAria")}
          className="mx-auto w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-surface shadow-elevated">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="text-xs font-semibold text-text-secondary">{t("heroReviewLabel")}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-bold text-accent">
                {t("heroGoodCopy")}
              </span>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-end justify-between">
                <p className="text-6xl font-bold leading-none tracking-tight text-text-primary">82</p>
                <p className="text-sm font-medium text-text-muted">/ 100</p>
              </div>

              <div aria-hidden="true" className="mt-8 space-y-4">
                {verdictRows.map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span className="font-medium">{row.label}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: row.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              <p className="text-xs leading-6 text-text-muted">
                {t("heroReviewNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}