'use client'

import { useState } from 'react'
import { ExtractedMedicalData } from '@/app/actions/gemini'
import {
    CheckCircle2,
    Edit3,
    FileText,
    Pill,
    TestTube,
    Activity,
    User,
    Calendar,
    Building,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

type ExtractedDataReviewProps = {
    data: ExtractedMedicalData
    filePreview: string
    isPdf?: boolean
    onConfirm: (editedData: ExtractedMedicalData) => void
    onCancel: () => void
}

/**
 * Checks if a test result value is outside the reference range
 * Handles various formats: "13.0-17.0", "5,000-10,000", "<5", ">100"
 */
function isValueAbnormal(result: string | null, referenceRange: string | null): boolean {
    if (!result || !referenceRange) return false

    // Parse numeric value from result (remove commas, extract number)
    const numericResult = parseFloat(result.replace(/,/g, ''))
    if (isNaN(numericResult)) return false

    // Parse reference range
    // Handle comparative operators (<, >)
    if (referenceRange.includes('<')) {
        const max = parseFloat(referenceRange.replace(/[<\s,]/g, ''))
        return !isNaN(max) && numericResult >= max
    }

    if (referenceRange.includes('>')) {
        const min = parseFloat(referenceRange.replace(/[>\s,]/g, ''))
        return !isNaN(min) && numericResult <= min
    }

    // Handle range format "min-max" or "min - max"
    const rangeParts = referenceRange.split('-').map(p =>
        parseFloat(p.replace(/[,\s]/g, ''))
    )

    if (rangeParts.length === 2 && !isNaN(rangeParts[0]) && !isNaN(rangeParts[1])) {
        const [min, max] = rangeParts
        return numericResult < min || numericResult > max
    }

    return false
}

export function ExtractedDataReview({
    data,
    filePreview,
    isPdf = false,
    onConfirm,
    onCancel
}: ExtractedDataReviewProps) {
    const [editedData, setEditedData] = useState<ExtractedMedicalData>(data)
    const [isEditing, setIsEditing] = useState(false)
    const [expandedSections, setExpandedSections] = useState({
        medications: true,
        tests: true,
        vitals: true
    })

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const getDocumentTypeBadge = (type: string | null) => {
        const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
            lab_report: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Lab Report' },
            prescription: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Prescription' },
            diagnosis: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Diagnosis' },
            imaging: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Imaging' },
            other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Other' }
        }

        const config = typeConfig[type || 'other'] || typeConfig.other
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        )
    }

    const updateField = (field: keyof ExtractedMedicalData, value: unknown) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="space-y-4">
            {/* Header with Image Preview */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Review Extracted Data</h2>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEditing
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Edit3 className="h-3.5 w-3.5" />
                            {isEditing ? 'Editing' : 'Edit'}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Verify and edit the AI-extracted information before encrypting
                    </p>
                </div>

                {/* Compact Preview */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex gap-3">
                        {isPdf ? (
                            <div className="h-16 w-16 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                                <FileText className="h-8 w-8 text-red-500" />
                            </div>
                        ) : (
                            <img
                                src={filePreview}
                                alt="Document"
                                className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {getDocumentTypeBadge(editedData.document_type)}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {editedData.notes || 'Medical document scanned successfully'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Basic Information
                </h3>

                <div className="space-y-3">
                    {/* Patient Name */}
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Patient Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedData.patient_name || ''}
                                    onChange={(e) => updateField('patient_name', e.target.value)}
                                    className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-sm text-gray-900">{editedData.patient_name || 'Not detected'}</p>
                            )}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Document Date</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    value={editedData.date || ''}
                                    onChange={(e) => updateField('date', e.target.value)}
                                    className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-sm text-gray-900">{editedData.date || 'Not detected'}</p>
                            )}
                        </div>
                    </div>

                    {/* Provider */}
                    <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500">Healthcare Provider</label>
                            {isEditing ? (
                                <div className="space-y-1 mt-0.5">
                                    <input
                                        type="text"
                                        placeholder="Doctor name"
                                        value={editedData.provider?.name || ''}
                                        onChange={(e) => updateField('provider', { ...editedData.provider, name: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Facility"
                                        value={editedData.provider?.facility || ''}
                                        onChange={(e) => updateField('provider', { ...editedData.provider, facility: e.target.value })}
                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-900">
                                    {editedData.provider?.name || editedData.provider?.facility
                                        ? `${editedData.provider?.name || ''}${editedData.provider?.name && editedData.provider?.facility ? ' - ' : ''}${editedData.provider?.facility || ''}`
                                        : 'Not detected'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagnosis */}
            {editedData.diagnosis && editedData.diagnosis.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-600" />
                        Diagnosis
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {editedData.diagnosis.map((d, i) => (
                            <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                                {d}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Medications Section */}
            {editedData.medications && editedData.medications.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => toggleSection('medications')}
                        className="w-full p-4 flex items-center justify-between"
                    >
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Pill className="h-4 w-4 text-purple-600" />
                            Medications ({editedData.medications.length})
                        </h3>
                        {expandedSections.medications ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.medications && (
                        <div className="px-4 pb-4 space-y-2">
                            {editedData.medications.map((med, i) => (
                                <div key={i} className="p-3 bg-purple-50 rounded-xl">
                                    <p className="font-medium text-sm text-gray-900">{med.name}</p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {[med.dosage, med.frequency, med.duration].filter(Boolean).join(' • ') || 'No details'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tests Section */}
            {editedData.tests && editedData.tests.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <button
                        onClick={() => toggleSection('tests')}
                        className="w-full p-4 flex items-center justify-between"
                    >
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-blue-600" />
                            Lab Tests ({editedData.tests.length})
                        </h3>
                        {expandedSections.tests ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                    </button>

                    {expandedSections.tests && (
                        <div className="px-4 pb-4">
                            <div className="space-y-2">
                                {editedData.tests.map((test, i) => {
                                    const isAbnormal = isValueAbnormal(test.result, test.reference_range)

                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${isAbnormal
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-blue-50 border-transparent'
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{test.name}</p>
                                                {test.reference_range && (
                                                    <p className="text-xs text-gray-500">Ref: {test.reference_range}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold text-sm ${isAbnormal ? 'text-red-600' : 'text-blue-700'
                                                    }`}>
                                                    {test.result} {test.unit}
                                                </p>
                                                {isAbnormal && (
                                                    <p className="text-xs text-red-600 font-medium mt-0.5">
                                                        ⚠ Abnormal
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Vital Signs Section */}
            {editedData.vital_signs && (
                Object.values(editedData.vital_signs).some(v => v !== null)
            ) && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <button
                            onClick={() => toggleSection('vitals')}
                            className="w-full p-4 flex items-center justify-between"
                        >
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-red-600" />
                                Vital Signs
                            </h3>
                            {expandedSections.vitals ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                        </button>

                        {expandedSections.vitals && (
                            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                                {editedData.vital_signs.blood_pressure && (
                                    <div className="p-3 bg-red-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Blood Pressure</p>
                                        <p className="font-medium text-sm text-gray-900">{editedData.vital_signs.blood_pressure}</p>
                                    </div>
                                )}
                                {editedData.vital_signs.heart_rate && (
                                    <div className="p-3 bg-red-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Heart Rate</p>
                                        <p className="font-medium text-sm text-gray-900">{editedData.vital_signs.heart_rate}</p>
                                    </div>
                                )}
                                {editedData.vital_signs.temperature && (
                                    <div className="p-3 bg-red-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Temperature</p>
                                        <p className="font-medium text-sm text-gray-900">{editedData.vital_signs.temperature}</p>
                                    </div>
                                )}
                                {editedData.vital_signs.weight && (
                                    <div className="p-3 bg-red-50 rounded-xl">
                                        <p className="text-xs text-gray-500">Weight</p>
                                        <p className="font-medium text-sm text-gray-900">{editedData.vital_signs.weight}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            {/* Notes */}
            {editedData.notes && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">{editedData.notes}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(editedData)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all"
                >
                    <CheckCircle2 className="h-5 w-5" />
                    Confirm & Encrypt
                </button>
            </div>

            {/* Phase Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800">
                    <strong>Phase 2 Preview:</strong> Encryption and IPFS storage will be implemented in Phase 3.
                </p>
            </div>
        </div>
    )
}
