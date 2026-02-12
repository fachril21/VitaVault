'use client'

import { useEffect, useState, use } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import {
    ArrowLeft,
    Calendar,
    Shield,
    FileText,
    Pill,
    TestTubeDiagonal,
    Heart,
    Loader2,
    AlertCircle,
    Lock,
    Copy,
    Check,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface RecordDetail {
    id: string
    userId: string
    ipfsCid: string
    originalFilename: string | null
    fileType: string | null
    encryptedSymmetricKey: string
    accessConditions: Record<string, unknown>
    extractedData: Record<string, unknown> | null
    documentDate: string | null
    createdAt: string
    tags: string[]
}

export default function RecordDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const { user } = usePrivy()
    const [record, setRecord] = useState<RecordDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copiedCid, setCopiedCid] = useState(false)

    const userId = user?.id

    useEffect(() => {
        if (userId && id) {
            loadRecord()
        }
    }, [userId, id])

    async function loadRecord() {
        if (!userId) return

        try {
            const response = await fetch(`/api/records/${id}?userId=${encodeURIComponent(userId)}`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to load record')
            }

            const data = await response.json()
            setRecord(data.record)
        } catch (err) {
            console.error('Error loading record:', err)
            setError(err instanceof Error ? err.message : 'Failed to load record')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyCid = async () => {
        if (record?.ipfsCid) {
            await navigator.clipboard.writeText(record.ipfsCid)
            setCopiedCid(true)
            setTimeout(() => setCopiedCid(false), 2000)
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-gray-500">Loading record...</p>
                </div>
            </div>
        )
    }

    if (error || !record) {
        return (
            <div className="py-8">
                <Link
                    href="/records"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Records
                </Link>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle className="h-10 w-10 mx-auto text-red-400 mb-3" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {error || 'Record not found'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        The record may have been deleted or you don&apos;t have access.
                    </p>
                </div>
            </div>
        )
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const extractedData = record.extractedData as any
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/records"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Records
                </Link>

                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${getFileTypeColor(record.fileType)}`}>
                        <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-gray-900 line-clamp-2">
                            {record.originalFilename || 'Medical Record'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(record.fileType)}`}>
                                {getFileTypeLabel(record.fileType)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {record.documentDate
                                    ? format(new Date(record.documentDate), 'MMM d, yyyy')
                                    : format(new Date(record.createdAt), 'MMM d, yyyy')
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">End-to-End Encrypted</h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Protected with Lit Protocol encryption, stored on IPFS
                        </p>

                        {/* IPFS CID */}
                        <div className="bg-white/80 rounded-lg p-2.5">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-500">IPFS CID</span>
                                <button
                                    onClick={handleCopyCid}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                >
                                    {copiedCid ? (
                                        <><Check className="h-3 w-3" /> Copied</>
                                    ) : (
                                        <><Copy className="h-3 w-3" /> Copy</>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-700 font-mono break-all">
                                {record.ipfsCid}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="px-2 py-0.5 bg-white/80 rounded-full text-xs text-gray-600">
                                <Lock className="h-3 w-3 inline mr-1" />
                                Encrypted
                            </span>
                            <span className="px-2 py-0.5 bg-white/80 rounded-full text-xs text-gray-600">
                                📦 IPFS
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Extracted Data */}
            {extractedData && (
                <div className="space-y-3">
                    {/* Patient Info */}
                    {extractedData.patient_name && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Patient Information</h3>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Name</span>
                                    <span className="text-gray-900">{extractedData.patient_name}</span>
                                </div>
                                {extractedData.provider?.name && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Provider</span>
                                        <span className="text-gray-900">{extractedData.provider.name}</span>
                                    </div>
                                )}
                                {extractedData.provider?.facility && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Facility</span>
                                        <span className="text-gray-900">{extractedData.provider.facility}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Diagnosis */}
                    {extractedData.diagnosis && extractedData.diagnosis.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-amber-500" />
                                <h3 className="text-sm font-semibold text-gray-900">Diagnosis</h3>
                            </div>
                            <ul className="space-y-1">
                                {extractedData.diagnosis.map((d: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-amber-400 mt-1.5">•</span>
                                        {d}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Medications */}
                    {extractedData.medications && extractedData.medications.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Pill className="h-4 w-4 text-purple-500" />
                                <h3 className="text-sm font-semibold text-gray-900">Medications</h3>
                            </div>
                            <div className="space-y-2">
                                {extractedData.medications.map((med: { name: string; dosage?: string; frequency?: string; duration?: string }, i: number) => (
                                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-sm font-medium text-gray-900">{med.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {med.dosage && <span className="text-xs text-gray-500">💊 {med.dosage}</span>}
                                            {med.frequency && <span className="text-xs text-gray-500">🕐 {med.frequency}</span>}
                                            {med.duration && <span className="text-xs text-gray-500">📅 {med.duration}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lab Tests */}
                    {extractedData.tests && extractedData.tests.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <TestTubeDiagonal className="h-4 w-4 text-blue-500" />
                                <h3 className="text-sm font-semibold text-gray-900">Lab Results</h3>
                            </div>
                            <div className="space-y-2">
                                {extractedData.tests.map((test: { name: string; result?: string; unit?: string; reference_range?: string }, i: number) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{test.name}</p>
                                            {test.reference_range && (
                                                <p className="text-xs text-gray-400">Ref: {test.reference_range}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">
                                                {test.result || '-'}
                                            </p>
                                            {test.unit && (
                                                <p className="text-xs text-gray-400">{test.unit}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vital Signs */}
                    {extractedData.vital_signs && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="h-4 w-4 text-red-500" />
                                <h3 className="text-sm font-semibold text-gray-900">Vital Signs</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {extractedData.vital_signs.blood_pressure && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Blood Pressure</p>
                                        <p className="text-sm font-semibold text-gray-900">{extractedData.vital_signs.blood_pressure}</p>
                                    </div>
                                )}
                                {extractedData.vital_signs.heart_rate && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Heart Rate</p>
                                        <p className="text-sm font-semibold text-gray-900">{extractedData.vital_signs.heart_rate}</p>
                                    </div>
                                )}
                                {extractedData.vital_signs.temperature && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Temperature</p>
                                        <p className="text-sm font-semibold text-gray-900">{extractedData.vital_signs.temperature}</p>
                                    </div>
                                )}
                                {extractedData.vital_signs.weight && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">Weight</p>
                                        <p className="text-sm font-semibold text-gray-900">{extractedData.vital_signs.weight}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {extractedData.notes && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-sm text-gray-700">{extractedData.notes}</p>
                        </div>
                    )}

                    {/* Follow-up */}
                    {extractedData.follow_up && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Follow-up</h3>
                            <p className="text-sm text-gray-700">{extractedData.follow_up}</p>
                        </div>
                    )}

                    {/* Tags */}
                    {record.tags && record.tags.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {record.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
