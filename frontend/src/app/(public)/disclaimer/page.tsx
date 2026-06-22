export default function DisclaimerPage() {
  return (
    <div className="pt-24 bg-secondary text-white">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Disclaimer</h1>
          <p className="text-xs text-white/30 font-mono mb-12">Last updated: 1 June 2026</p>

          <div className="space-y-8 text-sm text-white/70 font-mono leading-relaxed">
            <div className="glass-card p-6 border-error/30 bg-error/5 mb-8">
              <p className="text-sm font-semibold text-error mb-2">IMPORTANT LEGAL NOTICE</p>
              <p className="text-xs text-white/70">The following disclaimers apply to all users of Agrograte AI. Please read them carefully. If you do not agree with any of these disclaimers, do not use the Platform.</p>
            </div>

            <Section title="Financial Disclaimer">
              <p>Agrograte AI is a financial intelligence and data analytics platform. It is not a financial advisor, investment advisor, or financial planning service. The insights, forecasts, scores, and recommendations provided by the Platform:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Are for informational and analytical purposes only</li>
                <li>Do not constitute financial advice, investment advice, or any recommendation to buy, sell, or hold financial instruments</li>
                <li>Should not be used as the sole basis for financial decisions</li>
                <li>May not account for all relevant factors affecting your financial situation</li>
                <li>Are based on available data and mathematical models that may contain errors or inaccuracies</li>
              </ul>
              <p className="mt-2 text-warning">You should consult with a qualified financial advisor before making any financial decisions.</p>
            </Section>

            <Section title="Tax Disclaimer">
              <p>The tax calculations, VAT estimates, and compliance features provided by Agrograte AI:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Are estimates based on available data and tax rules as understood by the Platform</li>
                <li>May not reflect the most current tax legislation or interpretations</li>
                <li>Should not be used as the sole basis for tax filings or tax payments</li>
                <li>Do not constitute professional tax advice</li>
              </ul>
              <p className="mt-2 text-warning">You should consult with a qualified tax professional (such as a registered tax practitioner or accountant) regarding your specific tax situation. SARS regulations require that you take responsibility for the accuracy of your tax submissions.</p>
            </Section>

            <Section title="AI Disclaimer">
              <p>The AI and machine learning models powering Agrograte AI, including the DRRT engine and forecasting models:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>May produce predictions or classifications that are inaccurate or misleading</li>
                <li>Are trained on historical data that may not be representative of future conditions</li>
                <li>May reflect biases present in the training data</li>
                <li>Should be reviewed by a human before being used for significant decisions</li>
                <li>Continuously learn and may produce different results over time</li>
              </ul>
              <p className="mt-2">We strive to make our AI outputs explainable and transparent, but AI systems have inherent limitations. See our Responsible AI Statement for more information.</p>
            </Section>

            <Section title="Investment Disclaimer">
              <p>Agrograte AI does not offer investment products, manage investments, or provide investment advice. Any financial projections or forecasts provided by the Platform:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Are speculative in nature and based on assumptions that may not materialize</li>
                <li>Past performance is not indicative of future results</li>
                <li>Should not be construed as a guarantee of future financial outcomes</li>
                <li>Are not a recommendation to invest in any particular asset, security, or strategy</li>
              </ul>
            </Section>

            <Section title="Banking Disclaimer">
              <p>Our integration with Investec Programmable Banking and other banking providers:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Is provided as a convenience to connect your financial data</li>
                <li>Does not constitute an endorsement of Investec or any bank by Agrograte AI</li>
                <li>Is subject to the terms and conditions of the respective banking provider</li>
                <li>May be affected by changes to the bank&apos;s APIs, terms, or availability</li>
                <li>Does not make us responsible for the bank&apos;s services, security, or data handling</li>
              </ul>
            </Section>

            <Section title="Accuracy Disclaimer">
              <p>While we strive for accuracy in all data processing, analysis, and reporting:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Data may be delayed, incomplete, or contain errors</li>
                <li>Third-party data sources may not always be available or accurate</li>
                <li>Calculations and algorithms may have bugs or limitations</li>
                <li>We do not guarantee the accuracy, completeness, or timeliness of any information</li>
                <li>Users should verify critical information independently</li>
              </ul>
            </Section>

            <Section title="Not Professional Advice Disclaimer">
              <p>Agrograte AI is a technology platform, not a professional services firm. Nothing on the Platform constitutes professional advice of any kind, including but not limited to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Legal advice</li>
                <li>Accounting advice</li>
                <li>Tax advice</li>
                <li>Financial planning advice</li>
                <li>Investment advice</li>
              </ul>
              <p className="mt-2">You should engage qualified professionals for advice tailored to your specific circumstances. By using Agrograte AI, you acknowledge that you understand and accept these limitations.</p>
            </Section>

            <Section title="Contact">
              <div className="glass-card p-4 text-xs">
                <p>If you have questions about these disclaimers, please contact us at legal@agrograte.ai.</p>
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
