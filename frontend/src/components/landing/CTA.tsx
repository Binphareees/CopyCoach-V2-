import Link from "next/link";
import { GradientButton } from "../ui/gradient-button";
import { getServerT } from "@/i18n/server";

export default async function CTA() {
  const { t } = await getServerT("landing");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-2xl border border-border bg-surface px-8 py-16 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-text-primary md:text-5xl">
            {t("ctaTitle")}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-text-secondary">
            {t("ctaSubtitle")}
          </p>

          <div className="mt-10 flex justify-center">
            <GradientButton asChild>
              <Link href="/auth/signup">{t("ctaStartFree")}</Link>
            </GradientButton>
          </div>
        </div>
      </div>
    </section>
  );
}