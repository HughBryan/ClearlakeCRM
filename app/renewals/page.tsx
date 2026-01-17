'use client'

import { useEffect, useState } from 'react'
import { Navigation } from "@/components/navigation"
import { RenewalsSplitView } from "@/components/renewals-split-view"
import { ZoneRenewalWithQuotes } from "@/lib/types/database"

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<ZoneRenewalWithQuotes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch renewals
  useEffect(() => {
    fetchRenewals()
  }, [])

  const fetchRenewals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/renewals')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch renewals')
      }

      setRenewals(result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Toggle marked for deletion
  const handleToggleMarked = async (policyId: string, marked: boolean) => {
    try {
      const response = await fetch('/api/renewals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policy_id: policyId,
          marked_for_deletion: marked,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update renewal')
      }

      // Optimistically update the UI
      setRenewals(prev =>
        prev.map(renewal =>
          renewal.policy_id === policyId
            ? { ...renewal, marked_for_deletion: marked }
            : renewal
        )
      )
    } catch (err) {
      console.error('Error toggling marked status:', err)
      // Refresh data on error
      fetchRenewals()
    }
  }

  // Update comments
  const handleUpdateComments = async (policyId: string, comments: string) => {
    try {
      const response = await fetch('/api/renewals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policy_id: policyId,
          notes: comments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update comments')
      }

      // Optimistically update the UI
      setRenewals(prev =>
        prev.map(renewal =>
          renewal.policy_id === policyId
            ? { ...renewal, notes: comments }
            : renewal
        )
      )
    } catch (err) {
      console.error('Error updating comments:', err)
      // Refresh data on error
      fetchRenewals()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <main className="ml-64 pt-16 px-4 py-4">
        <div className="mb-5">
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl"></div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Loading renewals...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="bg-destructive/10 p-6 rounded-full">
              <svg className="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-sm text-muted-foreground">Unable to load renewals</p>
            </div>
            <button
              onClick={fetchRenewals}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        ) : (
          <RenewalsSplitView
            data={renewals}
            onToggleMarked={handleToggleMarked}
            onUpdateComments={handleUpdateComments}
          />
        )}
      </main>
    </div>
  )
}