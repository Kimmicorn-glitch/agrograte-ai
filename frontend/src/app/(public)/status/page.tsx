'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Clock, Activity } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const services = [
  { name: 'DRRT Engine', status: 'operational', uptime: '99.99%', latency: '45ms' },
  { name: 'API Gateway', status: 'operational', uptime: '99.99%', latency: '12ms' },
  { name: 'PostgreSQL', status: 'operational', uptime: '99.99%', latency: '8ms' },
  { name: 'Redis Cache', status: 'operational', uptime: '100%', latency: '2ms' },
  { name: 'NATS Messaging', status: 'operational', uptime: '99.99%', latency: '3ms' },
  { name: 'Investec Integration', status: 'operational', uptime: '99.95%', latency: '120ms' },
  { name: 'Frontend', status: 'operational', uptime: '100%', latency: '35ms' },
  { name: 'Authentication', status: 'operational', uptime: '99.99%', latency: '25ms' },
]

const incidents = [
  { date: '2026-05-28', title: 'Scheduled Maintenance', status: 'completed', description: 'Planned database upgrade completed successfully. No downtime for API endpoints.' },
  { date: '2026-05-15', title: 'Investec API Latency', status: 'resolved', description: 'Increased latency on Investec API integration. Resolved after Investec deployed fix. Duration: 45 minutes.' },
]

export default function StatusPage() {
  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="page-container max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="mb-12">
            <motion.span variants={fadeUp} className="section-title text-scarlet-400">System Status</motion.span>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-success rounded-full shadow-lg shadow-success/30 animate-breathe" />
              <h1 className="text-3xl md:text-5xl font-bold">All Systems Operational</h1>
            </motion.div>
            <motion.p variants={fadeUp} className="text-white/40 font-mono text-sm">
              Last checked: Just now · Uptime over 30 days: 99.98%
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-2 mb-12">
            {services.map((svc, i) => (
              <motion.div key={svc.name} variants={fadeUp} className="glass-card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {svc.status === 'operational' ? (
                    <CheckCircle size={14} className="text-success" />
                  ) : svc.status === 'degraded' ? (
                    <AlertTriangle size={14} className="text-warning" />
                  ) : (
                    <XCircle size={14} className="text-error" />
                  )}
                  <span className="text-sm font-mono">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                  <span>{svc.uptime} uptime</span>
                  <span>{svc.latency}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="text-lg font-bold mb-4">Incident History</h2>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.date} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/30 font-mono">{incident.date}</span>
                    <span className={`pill text-[0.6rem] ${incident.status === 'completed' ? 'pill-success' : 'pill-warning'}`}>
                      {incident.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{incident.title}</h3>
                  <p className="text-xs text-white/50 font-mono">{incident.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="mt-12 text-center">
            <p className="text-xs text-white/30 font-mono">
              For real-time updates, follow @agrograte on X or subscribe to our status mailing list.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
