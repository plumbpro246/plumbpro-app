import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const lastUpdated = "March 30, 2026";

  return (
    <div className="min-h-screen bg-slate-900 text-white" data-testid="privacy-policy-page">
      {/* Header */}
      <header className="bg-[#003366] border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
            data-testid="privacy-back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">
              PLUMB<span className="text-[#FF5F00]">PRO</span> Privacy Policy
            </h1>
            <p className="text-sm text-slate-300">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="prose prose-invert prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">1. Introduction</h2>
            <p className="text-slate-300 leading-relaxed">
              PlumbPro ("we," "our," or "us") operates the PlumbPro field companion application and website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and services. By using PlumbPro, you agree to the collection and use of information as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">2. Information We Collect</h2>
            <h3 className="text-lg font-bold text-white mt-4">Personal Information</h3>
            <ul className="text-slate-300 space-y-1 list-disc pl-5">
              <li>Name and email address (provided during registration)</li>
              <li>Company name (optional, provided during registration)</li>
              <li>Payment information (processed securely through Stripe or Google Play; we do not store card numbers)</li>
            </ul>
            <h3 className="text-lg font-bold text-white mt-4">Usage Data</h3>
            <ul className="text-slate-300 space-y-1 list-disc pl-5">
              <li>Job notes, timesheet entries, material lists, and job bids you create within the app</li>
              <li>Photos uploaded through the app for job documentation</li>
              <li>GPS location data (only when you enable geofencing for timesheet clock-in/clock-out)</li>
              <li>Device type, browser information, and general usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">3. How We Use Your Information</h2>
            <ul className="text-slate-300 space-y-1 list-disc pl-5">
              <li>To provide and maintain our service, including your account and subscription</li>
              <li>To process your payments through Stripe or Google Play Billing</li>
              <li>To generate AI-powered daily safety talks tailored to the plumbing industry</li>
              <li>To enable GPS-based timesheet tracking when you opt in to geofencing</li>
              <li>To store and sync your job notes, material lists, bids, and timesheets</li>
              <li>To send you important account notifications (subscription status, trial expiry)</li>
              <li>To improve our application and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">4. Data Storage & Security</h2>
            <p className="text-slate-300 leading-relaxed">
              Your data is stored on secure, encrypted servers. We use industry-standard security measures including HTTPS encryption, hashed passwords (bcrypt), and secure token-based authentication (JWT). Payment processing is handled entirely by Stripe and Google Play — we never store, process, or have access to your full credit card or debit card numbers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">5. GPS & Location Data</h2>
            <p className="text-slate-300 leading-relaxed">
              PlumbPro uses GPS location data only when you explicitly enable the geofencing feature for automatic timesheet clock-in and clock-out. Location data is used solely for determining if you are at a registered job site. You can disable location tracking at any time in your device settings or within the app's Settings page. We do not sell or share your location data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">6. Third-Party Services</h2>
            <p className="text-slate-300 leading-relaxed mb-3">We use the following third-party services:</p>
            <ul className="text-slate-300 space-y-1 list-disc pl-5">
              <li><strong>Stripe</strong> — Payment processing for web subscriptions</li>
              <li><strong>Google Play Billing</strong> — Payment processing for Android subscriptions</li>
              <li><strong>OpenAI</strong> — AI-generated daily safety talk content</li>
              <li><strong>MongoDB</strong> — Secure database for storing your app data</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-3">
              Each of these services has its own privacy policy governing their use of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">7. Data Retention</h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your account data for as long as your account is active or as needed to provide services. If you cancel your subscription, your data remains accessible in read-only mode. If you request account deletion, we will permanently delete your personal data within 30 days. Anonymized usage data may be retained for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">8. Your Rights</h2>
            <p className="text-slate-300 leading-relaxed mb-3">You have the right to:</p>
            <ul className="text-slate-300 space-y-1 list-disc pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of GPS location tracking at any time</li>
              <li>Export your data (notes, timesheets, bids) in PDF format</li>
              <li>Cancel your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">9. Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              PlumbPro is designed for professional plumbers and is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">10. Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. Continued use of PlumbPro after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">11. Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this Privacy Policy or your data, contact us at:
            </p>
            <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 mt-3">
              <p className="text-white font-bold">PlumbPro</p>
              <p className="text-slate-300">Email: <a href="mailto:support@plumbpro.com" className="text-[#FF5F00] hover:underline">support@plumbpro.com</a></p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} PlumbPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
