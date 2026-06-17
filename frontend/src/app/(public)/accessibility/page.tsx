export default function AccessibilityPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <Section title="Our Commitment">
              <p>Agrograte AI is committed to ensuring digital accessibility for all users, regardless of ability. We strive to meet WCAG 2.1 AA standards and continuously improve the user experience for everyone.</p>
            </Section>

            <Section title="Standards We Follow">
              <p>Our platform is built to conform to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines</li>
                <li><strong>POUR Principles:</strong> Perceivable, Operable, Understandable, Robust</li>
                <li><strong>Section 508:</strong> US federal procurement standards</li>
                <li><strong>EN 301 549:</strong> European accessibility standard for ICT</li>
              </ul>
            </Section>

            <Section title="Accessibility Features">
              <ul className="list-disc pl-5 space-y-1">
                <li>Semantic HTML structure with proper heading hierarchy</li>
                <li>ARIA labels and descriptions for interactive elements</li>
                <li>Keyboard-navigable interface with visible focus indicators</li>
                <li>Sufficient color contrast ratios (minimum 4.5:1 for normal text)</li>
                <li>Support for screen readers and assistive technologies</li>
                <li>Resizable text without loss of functionality (up to 200%)</li>
                <li>Reduced motion support via prefers-reduced-motion media query</li>
                <li>Alternative text for all non-decorative images and icons</li>
                <li>Clear error messages and form validation feedback</li>
                <li>Consistent navigation and predictable interface behavior</li>
              </ul>
            </Section>

            <Section title="Known Limitations">
              <p>We are actively working on the following areas:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Some third-party libraries may have accessibility gaps</li>
                <li>Data visualization components are being enhanced for screen reader compatibility</li>
                <li>Real-time updates (WebSocket data) require additional ARIA live region refinement</li>
                <li>Older browser versions may have partial support for modern CSS features</li>
              </ul>
            </Section>

            <Section title="Testing">
              <p>Our accessibility testing includes:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Automated testing with axe DevTools in CI/CD pipeline</li>
                <li>Manual testing with keyboard-only navigation</li>
                <li>Screen reader testing (NVDA, VoiceOver, JAWS)</li>
                <li>Color contrast analysis with automated tools</li>
                <li>User testing with people with disabilities (planned)</li>
              </ul>
            </Section>

            <Section title="Feedback">
              <p>We welcome your feedback. If you encounter accessibility barriers, please let us know:</p>
              <div className="glass-card p-4 mt-2 text-xs">
                <p>Email: accessibility@agrograte.ai</p>
                <p>We aim to respond within 5 business days</p>
              </div>
            </Section>

            <Section title="Continuous Improvement">
              <p>Accessibility is an ongoing process. We review our platform regularly and make improvements as we identify opportunities. This statement will be updated as our accessibility practices evolve.</p>
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
