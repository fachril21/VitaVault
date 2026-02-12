import { NextRequest, NextResponse } from 'next/server'
import { getMedicalRecord } from '@/lib/database-service'
import { retrieveFromIPFS } from '@/lib/ipfs-storage'
import { logAccessEvent } from '@/lib/database-service'

/**
 * GET /api/records/[id]
 * 
 * Retrieves a medical record's metadata and encrypted data from IPFS.
 * Decryption happens on the client side using Lit Protocol.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // 1. Fetch record metadata from Supabase with ownership check
    const record = await getMedicalRecord(id, userId)

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found or access denied' },
        { status: 404 }
      )
    }

    // 2. Retrieve encrypted data from IPFS
    let encryptedData: string | null = null
    try {
      encryptedData = await retrieveFromIPFS(record.ipfs_cid)
    } catch (ipfsError) {
      console.error('IPFS retrieval error:', ipfsError)
      // Still return the record metadata even if IPFS fails
    }

    // 3. Log access event
    await logAccessEvent(id, userId, 'view', {
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        userId: record.user_id,
        ipfsCid: record.ipfs_cid,
        originalFilename: record.original_filename,
        fileType: record.file_type,
        encryptedSymmetricKey: record.encrypted_symmetric_key,
        accessConditions: record.access_conditions,
        extractedData: record.extracted_data,
        documentDate: record.document_date,
        createdAt: record.created_at,
        tags: record.tags,
      },
      encryptedData,
    })
  } catch (error) {
    console.error('Record retrieval error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve record' },
      { status: 500 }
    )
  }
}
