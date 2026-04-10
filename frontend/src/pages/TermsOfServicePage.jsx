import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  const navigate = useNavigate();
  const lastUpdated = "March 30, 2026";

  document.title = "Terms of Service - PlumbPro Field Companion";

  return (
    <div className="min-h-screen bg-slate-900 text-white" data-testid="terms-of-service-page">
      {/* Header */}
      <header className="bg-[#003366] border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
            data-testid="terms-back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight">
              PLUMB<span className="text-[#FF5F00]">PRO</span> Terms of Service
            </h1>
            <p className="text-sm text-slate-300">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="prose prose-invert prose-sm max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">1. Acceptance of Terms</h2>
            <p className="text-slate-300 leading-relaxed">
              By accessing or using PlumbPro ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. PlumbPro reserves the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">2. Description of Service</h2>
            <p className="text-slate-300 leading-relaxed">
              PlumbPro is a field companion application designed for professional plumbers. The Service provides tools including job notes, plumbing formulas, AI-generated safety talks, timesheets with GPS tracking, material lists, job bidding, calendar scheduling, OSHA references, safety data sheets, a calculator, total station tools, blueprint management, and 2015 Uniform Plumbing Code (UPC) reference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">3. Account Registration</h2>
            <ul className="text-slate-300 space-y-2 list-disc pl-5">
              <li>You must provide accurate, complete, and current registration information</li>
              <li>You are responsible for maintaining the confidentiality of your password</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must be at least 18 years old to create an account</li>
              <li>One person or business entity may maintain only one account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">4. Subscription Plans & Pricing</h2>
            <p className="text-slate-300 leading-relaxed mb-3">PlumbPro offers the following monthly subscription plans:</p>
            <div className="bg-slate-800 border border-slate-700 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left px-4 py-2 text-white">Plan</th>
                    <th className="text-left px-4 py-2 text-white">Price</th>
                    <th className="text-left px-4 py-2 text-white">Billing</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-t border-slate-700">
                    <td className="px-4 py-2">Basic</td>
                    <td className="px-4 py-2">$4.99/month</td>
                    <td className="px-4 py-2">Monthly recurring</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="px-4 py-2">Pro</td>
                    <td className="px-4 py-2">$9.99/month</td>
                    <td className="px-4 py-2">Monthly recurring</td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="px-4 py-2">Enterprise</td>
                    <td className="px-4 py-2">$19.99/month</td>
                    <td className="px-4 py-2">Monthly recurring</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-300 leading-relaxed mt-3">
              Prices are in US Dollars and are subject to change with 30 days' notice to existing subscribers. Tax may apply depending on your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">5. Free Trial</h2>
            <ul className="text-slate-300 space-y-2 list-disc pl-5">
              <li>New users may be eligible for a free trial period</li>
              <li>Early adopters (first 100 users) receive a 3-month free trial on any plan</li>
              <li>Standard users receive a 7-day free trial</li>
              <li>Each user is limited to one free trial per account</li>
              <li>At the end of the trial period, you will need to subscribe to continue using premium features</li>
              <li>No credit card is required to start a free trial</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">6. Payment & Billing</h2>
            <ul className="text-slate-300 space-y-2 list-disc pl-5">
              <li>Web payments are processed securely through Stripe</li>
              <li>Android app payments are processed through Google Play Billing</li>
              <li>Subscriptions renew automatically each month unless cancelled</li>
              <li>You may cancel your subscription at any time; access continues until the end of the current billing period</li>
              <li>No partial refunds are given for unused portions of a billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">7. Refund Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              Due to the digital nature of our Service, all sales are final. However, if you experience a technical issue that prevents you from using the Service, contact us at plumbpro246@gmail.com within 7 days of your payment, and we will work to resolve the issue or provide a refund at our discretion. Refunds for Google Play purchases are subject to Google's refund policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">8. Acceptable Use</h2>
            <p className="text-slate-300 leading-relaxed mb-3">You agree not to:</p>
            <ul className="text-slate-300 space-y-1 list-disc pl-5">
              <li>Use the Service for any unlawful purpose</li>
              <li>Share your account credentials with others</li>
              <li>Attempt to reverse engineer, decompile, or disassemble the Service</li>
              <li>Use automated systems to access the Service (scraping, bots, etc.)</li>
              <li>Upload malicious content, viruses, or harmful files</li>
              <li>Resell, redistribute, or sublicense access to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">9. Intellectual Property</h2>
            <p className="text-slate-300 leading-relaxed">
              The PlumbPro application, including its design, code, features, and branding, is the intellectual property of PlumbPro. The 2015 Uniform Plumbing Code reference content is provided as a summary for field reference only; the official UPC is published by the International Association of Plumbing and Mechanical Officials (IAPMO). Your job data (notes, timesheets, bids, etc.) remains your property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">10. AI-Generated Content</h2>
            <p className="text-slate-300 leading-relaxed">
              PlumbPro uses artificial intelligence to generate daily safety talks. While we strive for accuracy, AI-generated content is provided for informational purposes only and should not be considered a substitute for professional safety training, OSHA compliance programs, or official safety guidelines. Always verify safety information with qualified professionals and official regulatory sources.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">11. Disclaimer of Warranties</h2>
            <p className="text-slate-300 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. PLUMBPRO DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. PLUMBING CODE REFERENCES, FORMULAS, AND CALCULATIONS ARE PROVIDED FOR CONVENIENCE AND SHOULD BE VERIFIED AGAINST OFFICIAL SOURCES. PLUMBPRO IS NOT RESPONSIBLE FOR ERRORS IN CALCULATIONS OR CODE REFERENCES.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">12. Limitation of Liability</h2>
            <p className="text-slate-300 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PLUMBPRO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">13. Termination</h2>
            <p className="text-slate-300 leading-relaxed">
              We may suspend or terminate your account if you violate these Terms. You may terminate your account at any time by contacting plumbpro246@gmail.com. Upon termination, your right to use the Service ceases immediately. We may retain your data for up to 30 days after termination before permanent deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">14. Governing Law</h2>
            <p className="text-slate-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#FF5F00] uppercase">15. Contact</h2>
            <p className="text-slate-300 leading-relaxed">
              For questions about these Terms of Service, contact us at:
            </p>
            <div className="bg-slate-800 border border-slate-700 rounded-sm p-4 mt-3">
              <p className="text-white font-bold">PlumbPro</p>
              <p className="text-slate-300">Email: <a href="mailto:plumbpro246@gmail.com" className="text-[#FF5F00] hover:underline">plumbpro246@gmail.com</a></p>
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
