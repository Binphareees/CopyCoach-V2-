import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Data Deletion - CopyCoach AI",
  description: "CopyCoach AI User Data Deletion Instructions",
};

export default function DeletionPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">User Data Deletion</h1>
        <p className="text-sm text-text-muted mb-8">How to request deletion of your personal data</p>

        <div className="space-y-8 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Requesting Data Deletion</h2>
            <p className="mb-3">
              You can request deletion of your personal data at any time. We will process your request within 30 days.
            </p>
            <p className="mb-3">To request data deletion, use any of the following methods:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>In-App:</strong> Go to Dashboard → Profile Settings → Support Hub and submit a deletion request.</li>
              <li><strong>Email:</strong> Send a deletion request from the email address associated with your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">What Gets Deleted</h2>
            <p className="mb-2">Upon successful deletion request, we will remove:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your account profile (name, email, avatar)</li>
              <li>Brand voice settings and preferences</li>
              <li>Project names and metadata</li>
              <li>Payment and subscription records</li>
              <li>Authentication credentials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Data Retained After Deletion</h2>
            <p className="mb-2">The following may be retained in anonymized or aggregated form:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Anonymized copy analysis data used for AI model improvement</li>
              <li>Aggregated usage statistics (non-identifiable)</li>
              <li>Records required by law or for fraud prevention</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Self-Service Deletion</h2>
            <p>
              You can also delete your account directly from the app by navigating to Dashboard → Profile Settings → Account section and selecting &quot;Delete Account.&quot; This action is irreversible.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">Contact</h2>
            <p>
              For any questions about data deletion, please reach out through our in-app support channel.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
