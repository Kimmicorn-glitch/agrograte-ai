export default function CookiePolicyPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <Section title="1. What Are Cookies">
              <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, understand how you use the site, and improve your experience.</p>
            </Section>

            <Section title="2. How We Use Cookies">
              <p>Agrograte AI uses cookies and similar tracking technologies for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Essential Cookies:</strong> Required for platform functionality, authentication, and security. These cannot be disabled.</li>
                <li><strong>Session Cookies:</strong> Maintain your session state while logged in.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use the platform to improve it (e.g., page visits, feature usage).</li>
                <li><strong>Security Cookies:</strong> Detect and prevent fraudulent activity.</li>
              </ul>
            </Section>

            <Section title="3. Types of Cookies We Use">
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold mb-1">Essential Cookies</h3>
                  <p className="text-xs text-white/50">Authentication tokens, CSRF tokens, session management. These are necessary for the platform to function.</p>
                </div>
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold mb-1">Analytics Cookies</h3>
                  <p className="text-xs text-white/50">Page views, feature usage, navigation paths. Used to improve platform usability and performance.</p>
                </div>
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold mb-1">Preference Cookies</h3>
                  <p className="text-xs text-white/50">Theme selection, language preferences, dashboard layout settings.</p>
                </div>
              </div>
            </Section>

            <Section title="4. Third-Party Cookies">
              <p>We may use limited third-party services that set cookies:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Cloudflare (security and performance)</li>
                <li>Vercel (hosting and analytics)</li>
              </ul>
              <p className="mt-2">We do not use advertising cookies or tracking for marketing purposes.</p>
            </Section>

            <Section title="5. Managing Cookies">
              <p>You can control and manage cookies in several ways:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                <li><strong>Platform Settings:</strong> You can adjust cookie preferences in your account settings</li>
                <li><strong>Do Not Track:</strong> We respect Do Not Track (DNT) browser signals</li>
              </ul>
              <p className="mt-2">Note that blocking essential cookies may prevent the platform from functioning properly.</p>
            </Section>

            <Section title="6. Cookie Retention">
              <p>Session cookies expire when you close your browser. Persistent cookies may remain for up to 12 months, after which they are automatically deleted. You can delete cookies at any time through your browser settings.</p>
            </Section>

            <Section title="7. Updates to This Policy">
              <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
            </Section>

            <Section title="8. Contact">
              <div className="glass-card p-4 text-xs">
                <p>If you have questions about our cookie practices, please contact us at privacy@agrograte.ai.</p>
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
