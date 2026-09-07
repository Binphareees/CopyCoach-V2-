import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - CopyCoach AI",
  description: "CopyCoach AI Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: September 8, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">1. Introduction</h2>
            <p>
              CopyCoach AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered copywriting coaching application and website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong>Profile Data:</strong> Brand voice preferences, target audience, and copywriting niche settings.</li>
              <li><strong>Usage Data:</strong> Copy text you submit for analysis, generated suggestions, and interaction patterns.</li>
              <li><strong>Payment Information:</strong> Processed securely through Paystack. We do not store card details.</li>
              <li><strong>Device &amp; Browser Data:</strong> IP address, browser type, and device identifiers for analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide and improve the CopyCoach AI service.</li>
              <li>Personalize your copywriting coaching experience.</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Send service-related communications and updates.</li>
              <li>Analyze usage trends to improve our AI models.</li>
              <li>Detect and prevent fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share information with trusted third-party service providers (Supabase, Vercel, Paystack, AI model providers) solely to operate and improve our service. These providers are bound by confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption in transit (TLS/SSL) and at rest. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">6. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. You may request deletion of your data at any time. Analyzed copy data may be retained in anonymized form for service improvement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">7. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access, correct, or delete your personal data.</li>
              <li>Export your data in a portable format.</li>
              <li>Opt out of non-essential data processing.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. Analytics cookies may be used to understand how you interact with our service. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">9. Children&apos;s Privacy</h2>
            <p>
              CopyCoach AI is not intended for users under 13 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us through our in-app support or email us at the address associated with your account.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
