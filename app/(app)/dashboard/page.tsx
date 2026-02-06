'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '@/lib/supabase'
import type { MedicalRecord } from '@/lib/database.types'
import Link from 'next/link'
import {
    Plus,
    FileHeart,
    Calendar,
    Tag,
    Share2,
    Eye,
    Loader2
} from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
    const { user } = usePrivy()
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)

    const userId = user?.id

    useEffect(() => {
        if (userId) {
            loadRecords()
        }
    }, [userId])

    async function loadRecords() {
        if (!userId) return

        try {
            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', userId)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error loading records:', error)
            } else {
                setRecords(data || [])
            }
        } catch (err) {
            console.error('Failed to load records:', err)
        } finally {
            setLoading(false)
        }
    }

    const getFileTypeLabel = (type: string | null) => {
        const labels: Record<string, string> = {
            lab_report: 'Lab Report',
            prescription: 'Prescription',
            diagnosis: 'Diagnosis',
            imaging: 'Imaging',
            other: 'Other'
        }
        return type ? labels[type] || 'Document' : 'Document'
    }

    const getFileTypeColor = (type: string | null) => {
        const colors: Record<string, string> = {
            lab_report: 'bg-blue-100 text-blue-700',
            prescription: 'bg-purple-100 text-purple-700',
            diagnosis: 'bg-amber-100 text-amber-700',
            imaging: 'bg-pink-100 text-pink-700',
            other: 'bg-gray-100 text-gray-700'
        }
        return type ? colors[type] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-gray-500">Loading your records...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">My Records</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {records.length} record{records.length !== 1 ? 's' : ''} stored
                    </p>
                </div>
                <Link
                    href="/scan"
                    className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add
                </Link>
            </div>

            {/* Records List */}
            {records.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <FileHeart className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No records yet</h2>
                    <p className="text-gray-500 mb-6 text-sm max-w-xs mx-auto">
                        Scan your first medical document to get started.
                    </p>
                    <Link
                        href="/scan"
                        className="inline-flex items-center gap-2 text-emerald-600 font-medium text-sm hover:underline"
                    >
                        <Plus className="h-4 w-4" />
                        Scan your first document
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white rounded-xl border border-gray-100 p-4 active:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Type Badge */}
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mb-2 ${getFileTypeColor(record.file_type)}`}>
                                        {getFileTypeLabel(record.file_type)}
                                    </span>

                                    {/* Title */}
                                    <h3 className="font-medium text-gray-900 line-clamp-1">
                                        {record.original_filename || 'Medical Record'}
                                    </h3>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {record.document_date
                                                ? format(new Date(record.document_date), 'MMM d, yyyy')
                                                : format(new Date(record.created_at), 'MMM d, yyyy')
                                            }
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {record.tags && record.tags.length > 0 && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Tag className="h-3 w-3 text-gray-400" />
                                            <div className="flex flex-wrap gap-1">
                                                {record.tags.slice(0, 2).map((tag, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {record.tags.length > 2 && (
                                                    <span className="text-xs text-gray-400">+{record.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={`/records/${record.id}`}
                                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <Eye className="h-4 w-4 text-gray-600" />
                                    </Link>
                                    <button className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <Share2 className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
