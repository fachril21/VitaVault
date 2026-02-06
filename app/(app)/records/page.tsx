'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { supabase } from '@/lib/supabase'
import type { MedicalRecord } from '@/lib/database.types'
import Link from 'next/link'
import {
    Search,
    FolderOpen,
    Calendar,
    Tag,
    ChevronRight,
    Loader2,
    Filter
} from 'lucide-react'
import { format } from 'date-fns'

const fileTypes = [
    { value: 'all', label: 'All' },
    { value: 'lab_report', label: 'Lab Report' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'diagnosis', label: 'Diagnosis' },
    { value: 'imaging', label: 'Imaging' },
]

export default function RecordsPage() {
    const { user } = usePrivy()
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')

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

    const filteredRecords = records.filter((record) => {
        const matchesSearch =
            record.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesType = filterType === 'all' || record.file_type === filterType

        return matchesSearch && matchesType
    })

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

    const getFileTypeLabel = (type: string | null) => {
        const labels: Record<string, string> = {
            lab_report: 'Lab',
            prescription: 'Rx',
            diagnosis: 'Dx',
            imaging: 'Img',
            other: 'Other'
        }
        return type ? labels[type] || 'Doc' : 'Doc'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-gray-500">Loading records...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">All Records</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Browse and search your health documents
                </p>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
                {fileTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setFilterType(type.value)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterType === type.value
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <FolderOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No records found</h2>
                    <p className="text-gray-500 text-sm">
                        {searchQuery || filterType !== 'all'
                            ? 'Try adjusting your search or filter'
                            : 'Start by scanning your first document'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredRecords.map((record) => (
                        <Link
                            key={record.id}
                            href={`/records/${record.id}`}
                            className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 active:bg-gray-50 transition-colors"
                        >
                            {/* Type Badge */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getFileTypeColor(record.file_type)}`}>
                                {getFileTypeLabel(record.file_type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                                    {record.original_filename || 'Medical Record'}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {record.document_date
                                            ? format(new Date(record.document_date), 'MMM d, yyyy')
                                            : format(new Date(record.created_at), 'MMM d, yyyy')
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
