'use client'

import { useState } from 'react'
import { DocumentScanner } from '@/components/DocumentScanner'
import { ExtractedDataReview } from '@/components/ExtractedDataReview'
import { ExtractedMedicalData } from '@/app/actions/gemini'
import { ArrowLeft, CheckCircle, Lock } from 'lucide-react'

type ScanStep = 'upload' | 'review' | 'confirmed'

export default function ScanPage() {
    const [step, setStep] = useState<ScanStep>('upload')
    const [extractedData, setExtractedData] = useState<ExtractedMedicalData | null>(null)
    const [filePreview, setFilePreview] = useState<string>('')
    const [fileMimeType, setFileMimeType] = useState<string>('')

    const handleDataExtracted = (data: ExtractedMedicalData, preview: string, mimeType: string) => {
        setExtractedData(data)
        setFilePreview(preview)
        setFileMimeType(mimeType)
        setStep('review')
    }

    const handleConfirm = (editedData: ExtractedMedicalData) => {
        setExtractedData(editedData)
        setStep('confirmed')
        // Phase 3: Here we would encrypt and upload to IPFS
        console.log('Confirmed data:', editedData)
    }

    const handleCancel = () => {
        setStep('upload')
        setExtractedData(null)
        setFilePreview('')
        setFileMimeType('')
    }

    const handleNewScan = () => {
        setStep('upload')
        setExtractedData(null)
        setFilePreview('')
        setFileMimeType('')
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    {step === 'review' && (
                        <button
                            onClick={handleCancel}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {step === 'upload' && 'Scan Document'}
                            {step === 'review' && 'Review Data'}
                            {step === 'confirmed' && 'Document Saved'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {step === 'upload' && 'Upload or capture your medical records'}
                            {step === 'review' && 'Verify the extracted information'}
                            {step === 'confirmed' && 'Your document has been processed'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
                {['upload', 'review', 'confirmed'].map((s, i) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === s
                                ? 'bg-emerald-600 text-white'
                                : ['upload'].includes(step) && i > 0
                                    ? 'bg-gray-200 text-gray-500'
                                    : step === 'review' && i > 1
                                        ? 'bg-gray-200 text-gray-500'
                                        : 'bg-emerald-100 text-emerald-700'
                                }`}
                        >
                            {i + 1}
                        </div>
                        {i < 2 && (
                            <div
                                className={`w-12 h-1 mx-1 rounded ${(step === 'review' && i === 0) || step === 'confirmed'
                                    ? 'bg-emerald-200'
                                    : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Content */}
            {step === 'upload' && (
                <>
                    <DocumentScanner onDataExtracted={handleDataExtracted} />

                    {/* How it works */}
                    <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 text-sm">How it works</h3>
                        <div className="space-y-4">
                            {[
                                { step: 1, title: 'Upload or Scan', desc: 'Take a photo or upload your document' },
                                { step: 2, title: 'AI Extraction', desc: 'Gemini AI extracts structured data' },
                                { step: 3, title: 'Encrypt & Store', desc: 'Encrypted with Lit Protocol, stored on IPFS' }
                            ].map((item) => (
                                <div key={item.step} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-xs">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm">{item.title}</h4>
                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {step === 'review' && extractedData && (
                <ExtractedDataReview
                    data={extractedData}
                    filePreview={filePreview}
                    isPdf={fileMimeType === 'application/pdf'}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}

            {step === 'confirmed' && (
                <div className="space-y-4">
                    {/* Success Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Data Extracted Successfully!
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Your medical document has been analyzed and the data is ready for encryption.
                        </p>

                        {/* Document Type Badge */}
                        {extractedData?.document_type && (
                            <div className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                                {extractedData.document_type.replace('_', ' ')}
                            </div>
                        )}
                    </div>

                    {/* Phase 3 Placeholder */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Lock className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Next: Encrypt & Store</h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    Phase 3 will encrypt your data with Lit Protocol and store it securely on IPFS.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600">🔐 Lit Protocol</span>
                                    <span className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600">📦 IPFS Storage</span>
                                    <span className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600">🔑 Access Control</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleNewScan}
                            className="flex-1 px-6 py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                        >
                            Scan Another Document
                        </button>
                    </div>

                    {/* Extracted Data Summary */}
                    {extractedData && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Extracted Data Summary</h3>
                            <div className="space-y-2 text-sm">
                                {extractedData.patient_name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Patient</span>
                                        <span className="text-gray-900">{extractedData.patient_name}</span>
                                    </div>
                                )}
                                {extractedData.date && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Date</span>
                                        <span className="text-gray-900">{extractedData.date}</span>
                                    </div>
                                )}
                                {extractedData.medications && extractedData.medications.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Medications</span>
                                        <span className="text-gray-900">{extractedData.medications.length} items</span>
                                    </div>
                                )}
                                {extractedData.tests && extractedData.tests.length > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Lab Tests</span>
                                        <span className="text-gray-900">{extractedData.tests.length} tests</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
