/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase'
import type { MedicalRecord } from './database.types'

/**
 * Create a new medical record in the database.
 */
export async function createMedicalRecord(record: {
  user_id: string
  ipfs_cid: string
  original_filename?: string | null
  file_type?: 'lab_report' | 'prescription' | 'diagnosis' | 'imaging' | 'other' | null
  encrypted_symmetric_key: string
  access_conditions: Record<string, unknown>
  extracted_data?: Record<string, unknown> | null
  document_date?: string | null
  tags?: string[]
}): Promise<MedicalRecord> {
  const insertData = {
    user_id: record.user_id,
    ipfs_cid: record.ipfs_cid,
    original_filename: record.original_filename ?? null,
    file_type: record.file_type ?? null,
    encrypted_symmetric_key: record.encrypted_symmetric_key,
    access_conditions: record.access_conditions,
    extracted_data: record.extracted_data ?? null,
    document_date: record.document_date ?? null,
    tags: record.tags ?? [],
  }

  const { data, error } = await (supabase
    .from('medical_records') as any)
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating medical record:', error)
    throw new Error(`Failed to save record: ${error.message}`)
  }

  return data as MedicalRecord
}

/**
 * Get a single medical record by ID with ownership check.
 */
export async function getMedicalRecord(
  recordId: string,
  userId: string
): Promise<MedicalRecord | null> {
  const { data, error } = await (supabase
    .from('medical_records') as any)
    .select('*')
    .eq('id', recordId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('Error fetching medical record:', error)
    throw new Error(`Failed to fetch record: ${error.message}`)
  }

  return data as MedicalRecord
}

/**
 * List all medical records for a user.
 */
export async function listMedicalRecords(
  userId: string,
  options?: {
    fileType?: string
    limit?: number
    offset?: number
  }
): Promise<{ records: MedicalRecord[]; total: number }> {
  let query = (supabase
    .from('medical_records') as any)
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (options?.fileType && options.fileType !== 'all') {
    query = query.eq('file_type', options.fileType)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options?.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error listing medical records:', error)
    throw new Error(`Failed to list records: ${error.message}`)
  }

  return {
    records: (data || []) as MedicalRecord[],
    total: count || 0,
  }
}

/**
 * Soft delete a medical record.
 */
export async function softDeleteRecord(
  recordId: string,
  userId: string
): Promise<void> {
  const { error } = await (supabase
    .from('medical_records') as any)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', recordId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting medical record:', error)
    throw new Error(`Failed to delete record: ${error.message}`)
  }
}

/**
 * Log an access event for audit trail.
 */
export async function logAccessEvent(
  recordId: string,
  userId: string | null,
  action: 'view' | 'download' | 'share' | 'revoke' | 'delete',
  metadata?: {
    sharedAccessId?: string
    ipAddress?: string
    userAgent?: string
  }
): Promise<void> {
  const { error } = await (supabase
    .from('access_logs') as any)
    .insert({
      record_id: recordId,
      user_id: userId,
      shared_access_id: metadata?.sharedAccessId || null,
      action,
      ip_address: metadata?.ipAddress || null,
      user_agent: metadata?.userAgent || null,
    })

  if (error) {
    // Don't throw on log failure — just warn
    console.warn('Failed to log access event:', error)
  }
}
