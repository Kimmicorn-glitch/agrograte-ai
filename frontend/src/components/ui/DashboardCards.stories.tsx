import React from 'react'
import { DashboardCards } from './DashboardCards'

export default {
  title: 'UI/DashboardCards',
  component: DashboardCards,
}

export const Sample = () => (
  <DashboardCards stats={[{ label: 'Cash', value: 'R 1,234,000' }, { label: 'VAT Due', value: 'R 12,300' }]} />
)
