export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <Section title="1. Introduction">
              <p>Agrograte AI (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
              <p className="mt-2">We comply with the Protection of Personal Information Act (POPIA) of South Africa, the General Data Protection Regulation (GDPR) of the European Union, and the California Consumer Privacy Act (CCPA).</p>
            </Section>

            <Section title="2. Information We Collect">
              <p className="font-semibold mb-2">Personal Information:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Name, email address, phone number</li>
                <li>Company/business details and registration numbers</li>
                <li>Tax reference numbers and VAT registration details</li>
                <li>Bank account information connected via Investec Programmable Banking</li>
                <li>Transaction data and financial records</li>
              </ul>
              <p className="font-semibold mb-2">Technical Information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address, browser type, device information</li>
                <li>Usage patterns and interaction data</li>
                <li>Cookies and similar tracking technologies (see Cookie Policy)</li>
              </ul>
            </Section>

            <Section title="3. How We Collect Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>Directly from you when you create an account, contact us, or use our services</li>
                <li>Automatically through your use of the platform (analytics, logs, cookies)</li>
                <li>From Investec Programmable Banking API (with your explicit consent)</li>
                <li>From third-party services you authorize us to connect</li>
              </ul>
            </Section>

            <Section title="4. How We Use Your Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide, maintain, and improve our services</li>
                <li>To process financial data through the DRRT intelligence engine</li>
                <li>To generate financial insights, forecasts, and compliance reports</li>
                <li>To communicate with you about your account and our services</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To comply with legal obligations and regulatory requirements</li>
              </ul>
            </Section>

            <Section title="5. Legal Basis for Processing (GDPR)">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Consent:</strong> You have given clear consent for us to process your data</li>
                <li><strong>Contract:</strong> Processing is necessary for the performance of our service agreement</li>
                <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with legal requirements (e.g., SARS)</li>
                <li><strong>Legitimate Interests:</strong> Processing is necessary for our legitimate business interests</li>
              </ul>
            </Section>

            <Section title="6. Data Storage and Security">
              <p>Your data is stored on secure servers located in South Africa (Azure South Africa North region). We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>AES-256 encryption at rest</li>
                <li>TLS 1.3 encryption in transit</li>
                <li>Access controls with RBAC and ABAC</li>
                <li>Regular security audits and penetration testing</li>
                <li>HashiCorp Vault for secrets management</li>
              </ul>
            </Section>

            <Section title="7. Data Retention">
              <p>We retain your data for the duration of your account plus 90 days after cancellation. Financial records may be retained for longer periods as required by SARS regulations (5 years) or other legal obligations. Upon expiry of the retention period, data is securely deleted.</p>
            </Section>

            <Section title="8. Third-Party Sharing">
              <p>We do not sell your personal information. We may share data with:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Investec:</strong> For banking integration (OAuth2 authenticated)</li>
                <li><strong>SARS:</strong> For tax compliance reporting (with your authorization)</li>
                <li><strong>Service Providers:</strong> Cloud infrastructure, analytics, and support services bound by data processing agreements</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              </ul>
            </Section>

            <Section title="9. Your Rights">
              <p className="mb-2">Under POPIA, GDPR, and CCPA, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Restriction:</strong> Limit processing of your data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time (does not affect lawful processing before withdrawal)</li>
              </ul>
            </Section>

            <Section title="10. Data Deletion">
              <p>To request data deletion, contact us at privacy@agrograte.ai. We will process your request within 30 days. Note that certain data may need to be retained for legal or regulatory compliance purposes.</p>
            </Section>

            <Section title="11. Cookies">
              <p>We use essential cookies for platform functionality and analytics cookies to improve our service. See our Cookie Policy for detailed information. You can manage cookie preferences through your browser settings.</p>
            </Section>

            <Section title="12. Contact Information">
              <p>For privacy-related inquiries, data subject requests, or to contact our Data Protection Officer:</p>
              <div className="mt-2 glass-card p-4 text-xs">
                <p>Email: privacy@agrograte.ai</p>
                <p>Address: South Africa</p>
                <p>Response Time: We aim to respond within 72 hours</p>
              </div>
            </Section>

            <Section title="13. Changes to This Policy">
              <p>We may update this Privacy Policy from time to time. Material changes will be notified via email or platform notification. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
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
