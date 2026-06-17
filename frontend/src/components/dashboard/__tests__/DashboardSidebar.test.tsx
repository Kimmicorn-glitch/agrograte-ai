import { render, screen } from '@testing-library/react'
import { DashboardSidebar } from '../DashboardSidebar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

describe('DashboardSidebar', () => {
  it('renders brand header', () => {
    render(<DashboardSidebar><div /></DashboardSidebar>)
    expect(screen.getByText('AGROGRATE')).toBeInTheDocument()
    expect(screen.getByText('Financial Intelligence OS')).toBeInTheDocument()
  })

  it('renders navigation sections', () => {
    render(<DashboardSidebar><div /></DashboardSidebar>)
    expect(screen.getByText('Command Center')).toBeInTheDocument()
    expect(screen.getByText('Financial Galaxy')).toBeInTheDocument()
    expect(screen.getByText('Tensor State')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('SARS Status')).toBeInTheDocument()
    expect(screen.getByText('Approvals')).toBeInTheDocument()
  })

  it('renders system status footer', () => {
    render(<DashboardSidebar><div /></DashboardSidebar>)
    expect(screen.getByText('System Nominal')).toBeInTheDocument()
    expect(screen.getByText(/v0\.2\.0/)).toBeInTheDocument()
  })

  it('renders sidebar with children content', () => {
    render(<DashboardSidebar><div data-testid="child" /></DashboardSidebar>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
