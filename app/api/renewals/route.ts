import { NextResponse } from 'next/server'
import { ZoneRenewalWithQuotes } from '@/lib/types/database'
import { getRenewalsByAccountManager } from '@/lib/queries/renewals'

/**
 * GET /api/renewals
 * Returns renewals data filtered by account manager
 * Query params:
 *   - accountManager: Filter by account manager name (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountManager = searchParams.get('accountManager')

    if (!accountManager) {
      return NextResponse.json(
        { error: 'accountManager query parameter is required' },
        { status: 400 }
      )
    }

    // Query the database
    const renewals = await getRenewalsByAccountManager(accountManager)

    // Map the basic renewal data to match the expected interface
    const mappedRenewals: ZoneRenewalWithQuotes[] = renewals.map((renewal, index) => ({
      policy_id: renewal.policy_id,
      client_code: renewal.client_code,
      lob: renewal.lob,
      expiry_date: renewal.expiry_date,
      invoice_total: renewal.invoice_total,

      // CRM fields - using defaults for now since they're not in the Zone table query
      marked_for_deletion: false,
      status: renewal.status === true ? 'completed' : 'pending',
      notes: renewal.comments,

      // Additional fields
      client_name: renewal.client_name,
      account_manager: accountManager,
      client_group: null,
      inception_date: null,
      zone: null,
      ledger: null,
      client_id: null,
      client_group_id: null,
      account_manager_id: null,
      underwriter_name: null,
      underwriter_id: null,
      renewal_colour: null,
      renewal_order: index + 1,
      client_info: null,
      policy_number: null,
      transaction_type: null,
      revenue: null,

      // Timestamps
      marked_for_deletion_at: null,
      marked_for_deletion_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // No quotes for now
      quotes: [],
    }))

    return NextResponse.json({ data: mappedRenewals })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch renewals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/renewals
 * Update a renewal's marked_for_deletion status or notes
 * TODO: Implement database updates once the CRM metadata table is created
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { policy_id, marked_for_deletion, notes } = body

    if (!policy_id) {
      return NextResponse.json(
        { error: 'policy_id is required' },
        { status: 400 }
      )
    }

    // TODO: Implement actual database update
    // For now, return success without doing anything
    console.log('PATCH request received (not yet implemented):', { policy_id, marked_for_deletion, notes })

    return NextResponse.json({
      data: {
        policy_id,
        marked_for_deletion,
        notes,
        message: 'Update functionality not yet implemented'
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Unexpected error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
