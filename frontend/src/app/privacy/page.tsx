import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Privacy Policy - CopyCoach AI",
  description: "CopyCoach AI Privacy Policy",
};

export default async function PrivacyPage() {
  const { t } = await getServerT("legal");

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">{t("privacyTitle")}</h1>
        <p className="text-sm text-text-muted mb-8">{t("lastUpdatedLabel")} September 8, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyIntroTitle")}</h2>
            <p>{t("privacyIntroBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyCollectTitle")}</h2>
            <p className="mb-2">{t("privacyCollectIntro")}</p>
            <ul className="list-disc list-inside space-y-1 ms-4">
              <li><strong>{t("accountInformation")}</strong> {t("accountInformationText")}</li>
              <li><strong>{t("profileData")}</strong> {t("profileDataText")}</li>
              <li><strong>{t("usageData")}</strong> {t("usageDataText")}</li>
              <li><strong>{t("paymentInformation")}</strong> {t("paymentInformationText")}</li>
              <li><strong>{t("deviceBrowserData")}</strong> {t("deviceBrowserDataText")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyUseTitle")}</h2>
            <p className="mb-2">{t("privacyUseIntro")}</p>
            <ul className="list-disc list-inside space-y-1 ms-4">
              <li>{t("useProvideImprove")}</li>
              <li>{t("usePersonalize")}</li>
              <li>{t("useProcessPayments")}</li>
              <li>{t("useSendUpdates")}</li>
              <li>{t("useAnalyzeTrends")}</li>
              <li>{t("useDetectFraud")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacySharingTitle")}</h2>
            <p>{t("privacySharingBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacySecurityTitle")}</h2>
            <p>{t("privacySecurityBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyRetentionTitle")}</h2>
            <p>{t("privacyRetentionBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyRightsTitle")}</h2>
            <p className="mb-2">{t("privacyRightsIntro")}</p>
            <ul className="list-disc list-inside space-y-1 ms-4">
              <li>{t("rightAccess")}</li>
              <li>{t("rightExport")}</li>
              <li>{t("rightOptOut")}</li>
              <li>{t("rightWithdraw")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyCookiesTitle")}</h2>
            <p>{t("privacyCookiesBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyChildrenTitle")}</h2>
            <p>{t("privacyChildrenBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyChangesTitle")}</h2>
            <p>{t("privacyChangesBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("privacyContactTitle")}</h2>
            <p>{t("privacyContactBody")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}