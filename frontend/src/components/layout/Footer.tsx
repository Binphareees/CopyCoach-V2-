import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">

        {/* Brand */}
        <div>

          <div className="flex items-center gap-2">
            <Logo theme="dark" size="md" showTagline={true} />
          </div>

          <p className="mt-2 max-w-sm text-sm text-text-muted">
            Your AI-powered coach for mastering copywriting through interactive drills,
            real-time red-pen feedback, and framework mastery.
          </p>

        </div>


        {/* Links */}
        <div className="flex flex-wrap gap-6 text-sm text-text-muted">

          <a
            href="#features"
            className="transition hover:text-text-primary"
          >
            Features
          </a>

          <a
            href="#about-app"
            className="transition hover:text-text-primary"
          >
            About App
          </a>

          <a
            href="#pricing"
            className="transition hover:text-text-primary"
          >
            Pricing
          </a>

          <a
            href="#mobile-app"
            className="transition hover:text-accent text-accent font-medium"
          >
            Mobile App (Android/iOS)
          </a>

          <a
            href="#support"
            className="transition hover:text-text-primary"
          >
            Help & Support
          </a>

          <a
            href="#faq"
            className="transition hover:text-text-primary"
          >
            FAQ
          </a>

        </div>

      </div>


      <div className="mx-auto mt-8 max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted border-t border-border pt-6">

        <span>© {new Date().getFullYear()} CopyCoach AI. All rights reserved.</span>

        <div className="flex items-center gap-4 text-text-muted">
          <a href="#about-app" className="hover:text-text-primary transition">About</a>
          <span>•</span>
          <a href="#mobile-app" className="hover:text-accent transition">Download Mobile App</a>
          <span>•</span>
          <a href="#support" className="hover:text-text-primary transition">24/7 Support Hub</a>
        </div>

      </div>

    </footer>
  );
}
