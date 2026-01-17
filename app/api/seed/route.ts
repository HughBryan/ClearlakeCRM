import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * POST /api/seed
 * Seeds the database with sample renewal data for testing
 */
export async function POST() {
  try {
    // Sample renewals to insert into zone_working
    const sampleRenewals = [
      {
        policy_id: 'POL-2025-001',
        client_name: 'ABC Manufacturing Ltd',
        policy_number: 'POL-2025-001',
        account_manager: 'John Smith',
        expiry_date: '2025-03-15',
        invoice_total: 25000,
        revenue: 3750,
        zone: 'North',
        lob: 'Property',
        renewal_colour: 'Green',
        renewal_order: 1,
        transaction_type: 'Renewal',
        status: 'pending',
      },
      {
        policy_id: 'POL-2025-002',
        client_name: 'XYZ Services Inc',
        policy_number: 'POL-2025-002',
        account_manager: 'Jane Doe',
        expiry_date: '2025-04-20',
        invoice_total: 18500,
        revenue: 2775,
        zone: 'South',
        lob: 'Liability',
        renewal_colour: 'Amber',
        renewal_order: 2,
        transaction_type: 'Renewal',
        status: 'in_progress',
      },
      {
        policy_id: 'POL-2025-003',
        client_name: 'Tech Innovators LLC',
        policy_number: 'POL-2025-003',
        account_manager: 'Bob Johnson',
        expiry_date: '2025-02-28',
        invoice_total: 42000,
        revenue: 6300,
        zone: 'East',
        lob: 'Professional Indemnity',
        renewal_colour: 'Red',
        renewal_order: 1,
        transaction_type: 'Renewal',
        status: 'pending',
      },
      {
        policy_id: 'POL-2025-004',
        client_name: 'Global Traders Co',
        policy_number: 'POL-2025-004',
        account_manager: 'Sarah Williams',
        expiry_date: '2025-05-10',
        invoice_total: 31000,
        revenue: 4650,
        zone: 'West',
        lob: 'Marine',
        renewal_colour: 'Green',
        renewal_order: 3,
        transaction_type: 'Renewal',
        status: 'completed',
        marked_for_deletion: true,
      },
      {
        policy_id: 'POL-2025-005',
        client_name: 'Retail Solutions Ltd',
        policy_number: 'POL-2025-005',
        account_manager: 'John Smith',
        expiry_date: '2025-03-25',
        invoice_total: 15000,
        revenue: 2250,
        zone: 'North',
        lob: 'Property',
        renewal_colour: 'Amber',
        renewal_order: 2,
        transaction_type: 'Renewal',
        status: 'pending',
      },
    ]

    // Insert renewals
    const { data: renewals, error: renewalsError } = await supabaseAdmin
      .from('zone_working')
      .upsert(sampleRenewals, { onConflict: 'policy_id' })
      .select()

    if (renewalsError) {
      return NextResponse.json(
        { error: 'Failed to seed renewals', details: renewalsError },
        { status: 500 }
      )
    }

    // Add some sample quotes for a few renewals
    const sampleQuotes = [
      {
        policy_id: 'POL-2025-001',
        class: 'Property - Buildings',
        insurer: 'AXA',
        premium: 22000,
        broker_fee: 2200,
        comments: 'Best rate - recommended',
      },
      {
        policy_id: 'POL-2025-001',
        class: 'Property - Buildings',
        insurer: 'Allianz',
        premium: 24500,
        broker_fee: 2450,
        comments: 'Higher premium but better coverage',
      },
      {
        policy_id: 'POL-2025-002',
        class: 'General Liability',
        insurer: 'Zurich',
        premium: 16000,
        broker_fee: 1600,
        comments: 'Standard terms',
      },
      {
        policy_id: 'POL-2025-003',
        class: 'Professional Indemnity',
        insurer: 'Hiscox',
        premium: 38000,
        broker_fee: 3800,
        comments: 'Incumbent - renewal',
      },
      {
        policy_id: 'POL-2025-003',
        class: 'Professional Indemnity',
        insurer: 'CNA',
        premium: 35000,
        broker_fee: 3500,
        comments: 'Better price - consider switch',
      },
      {
        policy_id: 'POL-2025-003',
        class: 'Professional Indemnity',
        insurer: 'Beazley',
        premium: 39500,
        broker_fee: 3950,
        comments: 'Higher coverage limits',
      },
    ]

    const { data: quotes, error: quotesError } = await supabaseAdmin
      .from('quotes')
      .insert(sampleQuotes)
      .select()

    if (quotesError) {
      return NextResponse.json(
        { error: 'Failed to seed quotes', details: quotesError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      renewals: renewals?.length || 0,
      quotes: quotes?.length || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error', details: error },
      { status: 500 }
    )
  }
}