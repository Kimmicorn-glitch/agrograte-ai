export default function ResponsibleAIStatementPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Responsible AI Statement</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <Section title="Our Principles">
              <p>Agrograte AI is committed to developing and deploying artificial intelligence responsibly. Our approach is guided by the following principles:</p>
            </Section>

            <Section title="1. Explainability">
              <p>Every AI output on our platform includes an explanation of how it was derived. Our DRRT engine is designed for transparency — you can trace each coherence score, forecast, and recommendation back to its contributing factors. We do not use black-box models for critical financial decisions.</p>
            </Section>

            <Section title="2. Fairness and Bias Mitigation">
              <ul className="list-disc pl-5 space-y-1">
                <li>We actively test our models for bias across demographic and economic dimensions</li>
                <li>Training data is curated to be representative and inclusive</li>
                <li>We monitor for disparate impact and correct identified biases</li>
                <li>Model decisions are reviewed regularly for fairness</li>
                <li>Users can provide feedback on AI outputs to improve model performance</li>
              </ul>
            </Section>

            <Section title="3. Human Oversight">
              <ul className="list-disc pl-5 space-y-1">
                <li>AI outputs are presented as intelligence inputs, not as automated decisions</li>
                <li>Critical financial decisions always require human review</li>
                <li>Users can override, correct, or ignore AI-generated classifications and forecasts</li>
                <li>Compliance and tax recommendations include professional review prompts</li>
                <li>We provide confidence scores so users can assess AI reliability</li>
              </ul>
            </Section>

            <Section title="4. Privacy and Data Governance">
              <ul className="list-disc pl-5 space-y-1">
                <li>AI models are trained and operate within strict data governance frameworks</li>
                <li>Personal financial data is never used to train models without explicit consent</li>
                <li>Data used for AI processing is encrypted and access-controlled</li>
                <li>Users retain ownership and control of their data</li>
                <li>Model training respects data minimization principles</li>
              </ul>
            </Section>

            <Section title="5. Transparency and Disclosure">
              <ul className="list-disc pl-5 space-y-1">
                <li>We clearly label AI-generated content, predictions, and classifications</li>
                <li>Model limitations and confidence levels are disclosed alongside outputs</li>
                <li>Our AI methodologies are documented and accessible</li>
                <li>We publish information about model versions and changes</li>
                <li>Users can access the logic behind any AI-driven feature</li>
              </ul>
            </Section>

            <Section title="6. Continuous Improvement">
              <ul className="list-disc pl-5 space-y-1">
                <li>Models are continuously monitored for accuracy, drift, and performance</li>
                <li>User feedback is incorporated into model improvements</li>
                <li>We conduct regular ethical reviews of AI systems</li>
                <li>Model updates are versioned and communicated to users</li>
                <li>We stay current with AI ethics research and best practices</li>
              </ul>
            </Section>

            <Section title="7. Accountability">
              <p>We take responsibility for our AI systems. If an AI output causes harm or leads to an adverse outcome, we:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Investigate promptly and thoroughly</li>
                <li>Take corrective action, including model updates if necessary</li>
                <li>Communicate transparently with affected users</li>
                <li>Implement measures to prevent recurrence</li>
              </ul>
            </Section>

            <Section title="Reporting Concerns">
              <p>If you believe an AI output is biased, incorrect, or harmful, please report it to us:</p>
              <div className="glass-card p-4 mt-2 text-xs">
                <p>Email: ai-ethics@agrograte.ai</p>
                <p>We investigate all reports and respond within 10 business days</p>
              </div>
            </Section>

            <Section title="Governance">
              <p>Our AI governance framework includes regular reviews by our ethics committee, third-party audits, and compliance with applicable AI regulations. We are committed to the responsible evolution of AI as the technology and regulatory landscape develops.</p>
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
