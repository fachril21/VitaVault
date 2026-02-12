import { NextRequest, NextResponse } from 'next/server'
import { uploadToIPFS } from '@/lib/ipfs-storage'
import { createMedicalRecord } from '@/lib/database-service'

/**
 * POST /api/records/upload
 * 
 * Encrypts and stores a medical record:
 * 1. Receives extracted data + file info from the client
 * 2. Encrypts data client-side (Lit Protocol) before sending
 * 3. Uploads encrypted data to IPFS via Pinata
 * 4. Saves metadata to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      userId,
      encryptedData,       // Already encrypted by Lit Protocol on the client
      dataToEncryptHash,   // Hash for decryption verification
      accessConditions,    // Unified access control conditions used for encryption
      documentType,
      patientName,
      documentDate,
      originalFilename,
      extractedData,       // Unencrypted extracted data for Supabase querying
      tags,
    } = body

    // Validate required fields
    if (!userId || !encryptedData || !dataToEncryptHash || !accessConditions) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, encryptedData, dataToEncryptHash, accessConditions' },
        { status: 400 }
      )
    }

    // 1. Upload encrypted data to IPFS via Pinata
    const ipfsResult = await uploadToIPFS(encryptedData, {
      userId,
      filename: originalFilename || 'medical_record',
      documentType: documentType || 'other',
    })

    // 2. Save metadata to Supabase
    // Store the encrypted symmetric key (dataToEncryptHash) and access conditions
    // The actual encrypted data lives on IPFS, referenced by CID
    const record = await createMedicalRecord({
      user_id: userId,
      ipfs_cid: ipfsResult.cid,
      original_filename: originalFilename || null,
      file_type: documentType || null,
      encrypted_symmetric_key: dataToEncryptHash,
      access_conditions: accessConditions,
      extracted_data: extractedData || null,
      document_date: documentDate || null,
      tags: tags || [],
    })

    return NextResponse.json({
      success: true,
      recordId: record.id,
      ipfsCid: ipfsResult.cid,
      timestamp: ipfsResult.timestamp,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload record' },
      { status: 500 }
    )
  }
}
