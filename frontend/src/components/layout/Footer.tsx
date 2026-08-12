import Logo from "../ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">

        {/* Brand */}
        <div>

          <div className="flex items-center gap-2">
            <Logo theme="dark" size="sm" />
          </div>

          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Your AI-powered coach for mastering copywriting through practice,
            feedback, and improvement.
          </p>

        </div>


        {/* Links */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-400">

          <a
            href="#features"
            className="transition hover:text-white"
          >
            Features
          </a>


          <a
            href="#pricing"
            className="transition hover:text-white"
          >
            Pricing
          </a>


          <a
            href="#faq"
            className="transition hover:text-white"
          >
            FAQ
          </a>


          <a
            href="#"
            className="transition hover:text-white"
          >
            Privacy
          </a>


          <a
            href="#"
            className="transition hover:text-white"
          >
            Terms
          </a>

        </div>

      </div>


      <div className="mx-auto mt-8 max-w-7xl px-6 text-sm text-gray-500">

        © {new Date().getFullYear()} CopyCoach AI. All rights reserved.

      </div>

    </footer>
  );
}