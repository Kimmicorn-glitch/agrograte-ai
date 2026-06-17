import { render, screen } from '@testing-library/react'
import { SystemMetricsPanel } from '../SystemMetricsPanel'

describe('SystemMetricsPanel', () => {
  it('renders loading state when metrics is null', () => {
    render(<SystemMetricsPanel metrics={null} />)
    expect(screen.getByText(/loading metrics/i)).toBeInTheDocument()
  })

  it('renders metrics when provided', () => {
    render(
      <SystemMetricsPanel
        metrics={{
          apiLatency: 5,
          tensorUpdates: 42,
          memoryStates: '3.2 GB',
          activeRelationships: 7,
          uptime: '48h',
        }}
      />
    )
    expect(screen.getByText('5ms')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('3.2 GB')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('48h')).toBeInTheDocument()
  })

  it('shows DRRT Active badge when drrtActive is true', () => {
    render(
      <SystemMetricsPanel
        metrics={{ apiLatency: 5, tensorUpdates: 0, memoryStates: '1 GB', activeRelationships: 0, uptime: '1h' }}
        drrtActive
      />
    )
    expect(screen.getByText('DRRT Active')).toBeInTheDocument()
  })

  it('shows Standby badge when drrtActive is false', () => {
    render(
      <SystemMetricsPanel
        metrics={{ apiLatency: 5, tensorUpdates: 0, memoryStates: '1 GB', activeRelationships: 0, uptime: '1h' }}
        drrtActive={false}
      />
    )
    expect(screen.getByText('Standby')).toBeInTheDocument()
  })

  it('applies error status color for high latency', () => {
    render(
      <SystemMetricsPanel
        metrics={{ apiLatency: 100, tensorUpdates: 0, memoryStates: '1 GB', activeRelationships: 0, uptime: '1h' }}
      />
    )
    const latencyRow = screen.getByText('100ms')
    const statusDot = latencyRow.closest('[class*="flex items-center justify-between"]')?.querySelector('.status-dot')
    expect(statusDot?.className).toContain('status-dot-error')
  })
})
