import { NextRequest, NextResponse } from 'next/server'
import { listMedicalRecords } from '@/lib/database-service'

/**
 * GET /api/records
 * 
 * Lists all medical records for a user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const fileType = request.nextUrl.searchParams.get('fileType') || undefined
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    const { records, total } = await listMedicalRecords(userId, {
      fileType,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      records,
      total,
      hasMore: offset + records.length < total,
    })
  } catch (error) {
    console.error('List records error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list records' },
      { status: 500 }
    )
  }
}
