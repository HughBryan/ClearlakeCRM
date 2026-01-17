import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * Sync API Route - Zone Original to Zone Working
 *
 * This endpoint triggers the sync_zone_tables() database function
 * that handles the sync logic.
 *
 * Can be called:
 * 1. Manually via POST request
 * 2. By external cron service (Vercel Cron, GitHub Actions, etc.)
 * 3. By scheduled task in production
 */
export async function POST() {
  try {
    // Call the database function that handles all sync logic
    const { data, error } = await supabaseAdmin.rpc('sync_zone_tables')

    if (error) {
      console.error('Sync failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Sync failed',
          details: error
        },
        { status: 500 }
      )
    }

    // Get the latest sync history record to return stats
    const { data: syncHistory, error: historyError } = await supabaseAdmin
      .from('sync_history')
      .select('*')
      .eq('table_name', 'zone_working')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (historyError) {
      return NextResponse.json({
        success: true,
        message: 'Sync completed but could not retrieve history',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      sync: syncHistory
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error',
        details: error
      },
      { status: 500 }
    )
  }
}

// Optional: GET endpoint to view sync history
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('sync_history')
      .select('*')
      .eq('table_name', 'zone_working')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sync history', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      history: data
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected error', details: error },
      { status: 500 }
    )
  }
}
