/**
 * /analytics — Platform Analytics
 *
 * All queries are driven client-side by the period selector, so this page
 * is a thin wrapper around the AnalyticsClient component.
 */
import AnalyticsClient from '@/components/analytics/AnalyticsClient'

export default function AnalyticsPage() {
  return <AnalyticsClient />
}
