export default function SecurityDisclosurePage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Disclosure Program</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <Section title="Our Commitment to Security">
              <p>Agrograte AI takes the security of our platform and your data seriously. We welcome the contributions of security researchers in identifying and responsibly disclosing potential vulnerabilities.</p>
            </Section>

            <Section title="Scope">
              <p>This program covers vulnerabilities found in:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Agrograte AI web application (app.agrograte.ai)</li>
                <li>Agrograte AI API (api.agrograte.ai)</li>
                <li>Agrograte AI public website (agrograte.ai)</li>
                <li>Official Agrograte AI mobile applications (when available)</li>
                <li>Open-source components published by Agrograte AI</li>
              </ul>
              <p className="mt-2">Third-party services and platforms are outside the scope of this program.</p>
            </Section>

            <Section title="Out of Scope">
              <p>The following are considered out of scope:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Physical security attacks against facilities</li>
                <li>Social engineering attacks against employees or users</li>
                <li>Denial of Service (DoS) attacks</li>
                <li>Spam, phishing, or content injection attacks</li>
                <li>Attacks requiring physical access to a user&apos;s device</li>
                <li>Issues in third-party dependencies that are already publicly known</li>
                <li>Self-XSS or other attacks that require extensive user interaction</li>
              </ul>
            </Section>

            <Section title="Reporting Guidelines">
              <p>If you believe you have found a security vulnerability, please report it to us:</p>
              <div className="glass-card p-4 mt-2 mb-4 text-xs">
                <p><strong>Email:</strong> security@agrograte.ai</p>
                <p><strong>PGP Key:</strong> Available on request</p>
              </div>
              <p className="mb-2">Please include in your report:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>A clear description of the vulnerability</li>
                <li>Steps to reproduce the issue</li>
                <li>Potential impact assessment</li>
                <li>Your contact information (optional)</li>
                <li>Any proof-of-concept code (if applicable)</li>
              </ul>
            </Section>

            <Section title="Our Commitment to Researchers">
              <p>When you report a vulnerability to us in good faith, we commit to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Acknowledge receipt of your report within 72 hours</li>
                <li>Provide an initial assessment within 5 business days</li>
                <li>Keep you informed of our progress</li>
                <li>Work diligently to resolve confirmed vulnerabilities</li>
                <li>Credit you for the discovery (with your permission)</li>
                <li>Not pursue legal action for good-faith research</li>
              </ul>
            </Section>

            <Section title="Safe Harbor">
              <p>We consider security research conducted in accordance with this policy to be:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Authorized under the Computer Fraud and Abuse Act (CFAA)</li>
                <li>Exempt from applicable anti-circumvention provisions</li>
                <li>In the public interest and protected under safe harbor provisions</li>
              </ul>
              <p className="mt-2">We will not take legal action against researchers who act in good faith and comply with this policy.</p>
            </Section>

            <Section title="Recognition">
              <p>We maintain a hall of fame for researchers who report valid security vulnerabilities. With your permission, we will publicly acknowledge your contribution to the security of our platform.</p>
            </Section>

            <Section title="Contact">
              <div className="glass-card p-4 text-xs">
                <p><strong>Security Team Email:</strong> security@agrograte.ai</p>
                <p>We look forward to working with the security community to keep Agrograte AI safe for everyone.</p>
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
