import type { Metadata } from "next";
import { getServerT } from "@/i18n/server";

export const metadata: Metadata = {
  title: "User Data Deletion - CopyCoach AI",
  description: "CopyCoach AI User Data Deletion Instructions",
};

export default async function DeletionPage() {
  const { t } = await getServerT("legal");

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">{t("deletionTitle")}</h1>
        <p className="text-sm text-text-muted mb-8">{t("deletionSubtitle")}</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("deletionRequestTitle")}</h2>
            <p className="mb-3">{t("deletionRequestIntro")}</p>
            <p className="mb-3">{t("deletionRequestMethods")}</p>
            <ul className="list-disc list-inside space-y-2 ms-4">
              <li><strong>{t("deletionMethodInAppLabel")}</strong> {t("deletionMethodInAppText")}</li>
              <li><strong>{t("deletionMethodEmailLabel")}</strong> {t("deletionMethodEmailText")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("deletionWhatTitle")}</h2>
            <p className="mb-2">{t("deletionWhatIntro")}</p>
            <ul className="list-disc list-inside space-y-1 ms-4">
              <li>{t("whatProfile")}</li>
              <li>{t("whatBrandVoice")}</li>
              <li>{t("whatProjects")}</li>
              <li>{t("whatPayments")}</li>
              <li>{t("whatCredentials")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("deletionRetainedTitle")}</h2>
            <p className="mb-2">{t("deletionRetainedIntro")}</p>
            <ul className="list-disc list-inside space-y-1 ms-4">
              <li>{t("retainedAnalysis")}</li>
              <li>{t("retainedStats")}</li>
              <li>{t("retainedLegal")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("deletionSelfServiceTitle")}</h2>
            <p>{t("deletionSelfServiceBody")}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">{t("deletionContactTitle")}</h2>
            <p>{t("deletionContactBody")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}