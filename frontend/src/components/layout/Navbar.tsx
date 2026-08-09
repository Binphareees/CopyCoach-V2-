import Link from "next/link";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B5CEB] font-bold text-white">
            C
          </div>

          <span className="text-xl font-bold text-white">
            CopyCoach AI
          </span>
        </Link>


        {/* Navigation Links */}
        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">

          <Link
            href="#features"
            className="transition hover:text-white"
          >
            Features
          </Link>

          <Link
            href="#how-it-works"
            className="transition hover:text-white"
          >
            How It Works
          </Link>

          <Link
            href="#pricing"
            className="transition hover:text-white"
          >
            Pricing
          </Link>

          <Link
            href="#faq"
            className="transition hover:text-white"
          >
            FAQ
          </Link>

        </div>


        {/* Actions */}
        <div className="flex items-center gap-3">

          <Link
            href="/auth/login"
            className="hidden text-sm text-gray-300 transition hover:text-white sm:block"
          >
            Login
          </Link>


          <Button
            size="sm"
            href="/auth/signup"
          >
            Get Started
          </Button>

        </div>

      </div>
    </nav>
  );
}