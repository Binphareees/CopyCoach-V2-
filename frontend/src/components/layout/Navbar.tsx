import Link from "next/link";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import FeedbackModal from "../ui/FeedbackModal";
import DownloadAppModal from "../ui/DownloadAppModal";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-[#0B1020]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <Logo theme="dark" size="md" showTagline={true} />
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
            href="/download"
            className="transition hover:text-cyan-400 text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Download App</span>
          </Link>

        </div>


        {/* Actions */}
        <div className="flex items-center gap-3">
          <DownloadAppModal triggerClassName="hidden sm:inline-flex" triggerText="Get App (APK/iOS)" />
          <FeedbackModal triggerClassName="hidden sm:inline-flex" />

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