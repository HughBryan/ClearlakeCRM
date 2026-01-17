'use client'

import { useEffect, useState } from 'react'
import { Navigation } from "@/components/navigation"
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRenewals: 0,
    markedForDeletion: 0,
    totalRevenue: 0,
    totalQuotes: 0,
    upcomingExpiries: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/renewals')
      const result = await response.json()

      if (response.ok && result.data) {
        const renewals = result.data
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        setStats({
          totalRenewals: renewals.length,
          markedForDeletion: renewals.filter((r: any) => r.marked_for_deletion).length,
          totalRevenue: renewals.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0),
          totalQuotes: renewals.reduce((sum: number, r: any) => sum + (r.quotes?.length || 0), 0),
          upcomingExpiries: renewals.filter((r: any) => {
            if (!r.expiry_date) return false
            const expiryDate = new Date(r.expiry_date)
            return expiryDate >= now && expiryDate <= thirtyDaysFromNow
          }).length,
        })
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="ml-64 pt-16 px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                title="Total Renewals"
                value={stats.totalRenewals}
                color="blue"
                link="/renewals"
              />
              <StatCard
                title="Expiring Soon (30 days)"
                value={stats.upcomingExpiries}
                color="orange"
                link="/renewals"
              />
              <StatCard
                title="Marked for Deletion"
                value={stats.markedForDeletion}
                color="red"
                link="/renewals"
              />
              <StatCard
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                color="green"
              />
            </div>

          </>
        )}
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
  link,
}: {
  title: string
  value: string | number
  color: 'blue' | 'orange' | 'red' | 'green'
  link?: string
}) {
  const colors = {
    blue: 'text-primary',
    orange: 'text-destructive',
    red: 'text-destructive',
    green: 'text-success',
  }

  const content = (
    <div className="rounded-lg bg-card p-6 shadow hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }

  return content
}

