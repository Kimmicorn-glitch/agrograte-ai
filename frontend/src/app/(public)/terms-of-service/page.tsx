export default function TermsOfServicePage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <Section title="1. Acceptance of Terms">
              <p>By accessing or using Agrograte AI (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. We reserve the right to modify these terms at any time; continued use constitutes acceptance of modifications.</p>
            </Section>

            <Section title="2. Account Responsibility">
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be 18 years or older to use the Platform</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activity under your account</li>
                <li>You must provide accurate and complete information</li>
                <li>You must notify us immediately of any unauthorized account access</li>
                <li>You may create accounts for your employees, contractors, or clients with appropriate authorization</li>
              </ul>
            </Section>

            <Section title="3. Acceptable Use">
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Platform for any unlawful purpose or in violation of any applicable laws</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Interfere with or disrupt the Platform, servers, or networks</li>
                <li>Upload or transmit viruses, malware, or harmful code</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
                <li>Use the Platform to store or transmit infringing or otherwise unlawful material</li>
                <li>Exceed rate limits or use automated means to access the Platform without authorization</li>
              </ul>
            </Section>

            <Section title="4. Financial Disclaimer">
              <p className="text-warning mb-2">IMPORTANT: Agrograte AI is a financial intelligence tool, not a financial advisor.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Platform provides analytical insights, forecasts, and compliance automation — not financial advice</li>
                <li>All financial decisions should be made with the guidance of qualified professionals</li>
                <li>DRRT coherence scores and forecasts are estimates based on available data and may not predict actual outcomes</li>
                <li>Tax calculations are estimates and should be verified by a tax professional</li>
                <li>We are not responsible for losses resulting from reliance on Platform outputs</li>
              </ul>
            </Section>

            <Section title="5. Payment Terms">
              <ul className="list-disc pl-5 space-y-1">
                <li>Pricing is as specified on our Pricing page, denominated in South African Rand (ZAR)</li>
                <li>Payments are due in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as expressly stated</li>
                <li>We may change pricing with 30 days notice</li>
                <li>Late payments may result in service suspension</li>
                <li>VAT may be applied where applicable</li>
              </ul>
            </Section>

            <Section title="6. Intellectual Property">
              <ul className="list-disc pl-5 space-y-1">
                <li>The Platform, including its code, design, DRRT engine, and content, is owned by Agrograte AI</li>
                <li>You retain ownership of your financial data</li>
                <li>You grant us a license to process your data to provide services</li>
                <li>Our trademarks, logos, and brand assets may not be used without permission</li>
                <li>Feedback and suggestions may be used to improve the Platform without compensation</li>
              </ul>
            </Section>

            <Section title="7. Data Processing">
              <ul className="list-disc pl-5 space-y-1">
                <li>We process your data as described in our Privacy Policy</li>
                <li>We implement appropriate technical and organizational measures to protect your data</li>
                <li>Data is processed in South Africa unless otherwise specified</li>
                <li>We maintain data processing agreements with our sub-processors</li>
              </ul>
            </Section>

            <Section title="8. Limitation of Liability">
              <p className="mb-2">To the maximum extent permitted by law:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Platform is provided &quot;as is&quot; without warranties of any kind</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount paid by you in the 12 months preceding the claim</li>
                <li>We are not liable for service interruptions due to maintenance, third-party failures, or events beyond our control</li>
                <li>This limitation applies even if we have been advised of the possibility of such damages</li>
              </ul>
            </Section>

            <Section title="9. Indemnification">
              <p>You agree to indemnify and hold Agrograte AI harmless from any claims, damages, losses, and expenses arising from your use of the Platform, violation of these terms, or violation of any rights of third parties.</p>
            </Section>

            <Section title="10. Termination">
              <ul className="list-disc pl-5 space-y-1">
                <li>You may terminate your account at any time through the Platform or by contacting us</li>
                <li>We may suspend or terminate accounts for violation of these terms</li>
                <li>Upon termination, you may export your data within 30 days</li>
                <li>After 90 days, your data will be securely deleted (subject to legal retention requirements)</li>
                <li>Sections on liability, indemnification, intellectual property, and governing law survive termination</li>
              </ul>
            </Section>

            <Section title="11. Governing Law">
              <p>These Terms are governed by the laws of the Republic of South Africa. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of South Africa.</p>
            </Section>

            <Section title="12. Dispute Resolution">
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Informal Resolution:</strong> Contact us first to resolve the issue informally</li>
                <li><strong>Mediation:</strong> If informal resolution fails, the parties agree to mediate in good faith</li>
                <li><strong>Arbitration:</strong> If mediation fails, disputes shall be resolved by binding arbitration in accordance with the rules of the Arbitration Foundation of Southern Africa (AFSA)</li>
                <li><strong>Class Action Waiver:</strong> Disputes must be brought individually, not as class actions</li>
              </ol>
            </Section>

            <Section title="13. Entire Agreement">
              <p>These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Agrograte AI regarding your use of the Platform.</p>
            </Section>

            <Section title="14. Contact">
              <div className="glass-card p-4 text-xs">
                <p><strong>Agrograte AI</strong></p>
                <p>Email: legal@agrograte.ai</p>
                <p>South Africa</p>
              </div>
            </Section>
          </div>
        </div>
      </section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="text-sm text-white/60 font-mono leading-relaxed space-y-2">{children}</div>
    </div>
  )
}
