import Logo from "../ui/Logo";
import { getServerT } from "@/i18n/server";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export default async function Footer() {
  const { t } = await getServerT("landing");

  return (
    <footer className="border-t border-glass-border-subtle py-12">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">

        {/* Brand */}
        <div>

          <div className="flex items-center gap-2">
            <Logo theme="dark" size="md" showTagline={true} />
          </div>

          <p className="mt-2 max-w-sm text-sm text-text-muted">
            {t("footerTagline")}
          </p>

        </div>


        {/* Links */}
        <div className="flex flex-wrap gap-6 text-sm text-text-muted">

          <a
            href="#features"
            className="transition hover:text-text-primary"
          >
            {t("footerFeatures")}
          </a>

          <a
            href="#about-app"
            className="transition hover:text-text-primary"
          >
            {t("footerAboutApp")}
          </a>

          <a
            href="#pricing"
            className="transition hover:text-text-primary"
          >
            {t("footerPricing")}
          </a>

          <a
            href="#mobile-app"
            className="transition hover:text-accent text-accent font-medium"
          >
            {t("footerMobileApp")}
          </a>

          <a
            href="#support"
            className="transition hover:text-text-primary"
          >
            {t("footerHelpSupport")}
          </a>

          <a
            href="#faq"
            className="transition hover:text-text-primary"
          >
            {t("footerFaq")}
          </a>

        </div>

      </div>


      <div className="mx-auto mt-8 max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted border-t border-glass-border-subtle pt-6">

        <span>{t("footerCopyright", { year: new Date().getFullYear() })}</span>

        <LanguageSwitcher compact direction="up" />

        <div className="flex items-center gap-4 text-text-muted">
          <a href="#about-app" className="hover:text-text-primary transition">{t("footerAbout")}</a>
          <span>•</span>
          <a href="#mobile-app" className="hover:text-accent transition">{t("footerDownloadMobileApp")}</a>
          <span>•</span>
          <a href="#support" className="hover:text-text-primary transition">{t("footerSupportHub247")}</a>
        </div>

      </div>

    </footer>
  );
}