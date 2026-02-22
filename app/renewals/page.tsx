'use client'

import { useState, useEffect } from 'react'
import { Navigation } from "@/components/navigation"
import { RenewalsTableView } from "@/components/renewals-table-view"
import { ZoneRenewalWithQuotes } from "@/lib/types/database"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<ZoneRenewalWithQuotes[]>([])
  const [accountManagers, setAccountManagers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingManagers, setLoadingManagers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accountManager, setAccountManager] = useState('')

  // Fetch account managers on mount
  useEffect(() => {
    fetchAccountManagers()
  }, [])

  // Auto-fetch renewals when account manager changes
  useEffect(() => {
    if (accountManager) {
      fetchRenewals()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountManager])

  const fetchAccountManagers = async () => {
    try {
      setLoadingManagers(true)
      const response = await fetch('/api/renewals/account-managers')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch account managers')
      }

      setAccountManagers(result.data || [])
    } catch (err) {
      console.error('Error fetching account managers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load account managers')
    } finally {
      setLoadingManagers(false)
    }
  }

  const fetchRenewals = async () => {
    if (!accountManager.trim()) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ accountManager: accountManager.trim() })
      const response = await fetch(`/api/renewals?${params.toString()}`)

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to fetch renewals')
      }

      const result = await response.json()
      setRenewals(result.data || [])
    } catch (err) {
      console.error('Error fetching renewals:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setRenewals([])
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <main className="ml-64 pt-20 px-4 py-4 h-full overflow-hidden">
        <div className="mb-4 flex gap-3 items-center max-w-md">
          <div className="flex-1">
            <Select
              value={accountManager}
              onValueChange={setAccountManager}
              disabled={loadingManagers}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loadingManagers ? "Loading account managers..." : "Select account manager"} />
              </SelectTrigger>
              <SelectContent>
                {accountManagers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        ) : renewals.length === 0 && !error && !accountManager ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-muted-foreground text-center space-y-2">
              <p className="text-lg">Select an account manager to view renewals</p>
              <p className="text-sm">Use the dropdown above to filter renewals by account manager</p>
            </div>
          </div>
        ) : renewals.length === 0 && !error && accountManager ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="text-muted-foreground text-center space-y-2">
              <p className="text-lg">No renewals found</p>
              <p className="text-sm">No renewals found for {accountManager}</p>
            </div>
          </div>
        ) : (
          <RenewalsTableView
            data={renewals}
            onToggleMarked={handleToggleMarked}
            onUpdateComments={handleUpdateComments}
          />
        )}
      </main>
    </div>
  )
}