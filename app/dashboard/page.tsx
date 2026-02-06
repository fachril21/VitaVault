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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Health Records</h1>
                    <p className="text-gray-500 mt-1">
                        {records.length} record{records.length !== 1 ? 's' : ''} stored securely
                    </p>
                </div>
                <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Record
                </Link>
            </div>

            {/* Records Grid */}
            {records.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <FileHeart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No records yet</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Upload your first medical document to get started. Your records will be encrypted and stored securely on IPFS.
                    </p>
                    <Link
                        href="/dashboard/upload"
                        className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:underline"
                    >
                        <Plus className="h-4 w-4" />
                        Upload your first document
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                        >
                            {/* Type Badge */}
                            <div className="flex items-start justify-between mb-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(record.file_type)}`}>
                                    {getFileTypeLabel(record.file_type)}
                                </span>
                            </div>

                            {/* Title/Name */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {record.original_filename || 'Medical Record'}
                            </h3>

                            {/* Date */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {record.document_date
                                        ? format(new Date(record.document_date), 'MMM d, yyyy')
                                        : format(new Date(record.created_at), 'MMM d, yyyy')
                                    }
                                </span>
                            </div>

                            {/* Tags */}
                            {record.tags && record.tags.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                                    <div className="flex flex-wrap gap-1">
                                        {record.tags.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                <Link
                                    href={`/dashboard/records/${record.id}`}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </Link>
                                <Link
                                    href={`/dashboard/share/${record.id}`}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
