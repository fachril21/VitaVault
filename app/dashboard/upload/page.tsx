'use client'

import { Upload, FileImage, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Medical Record</h1>
            <p className="text-gray-500 mb-8">
                Scan or upload your medical documents. AI will extract the data and encrypt it.
            </p>

            {/* Upload Zone - Placeholder for Phase 2 */}
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center hover:border-emerald-400 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                    <Upload className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Drop your document here
                </h2>
                <p className="text-gray-500 mb-6">
                    Supports JPG, PNG, PDF up to 10MB
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        disabled
                    >
                        <FileImage className="h-5 w-5" />
                        Select File
                    </button>
                    <span className="text-gray-400">or</span>
                    <button
                        className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        disabled
                    >
                        📸 Use Camera
                    </button>
                </div>
            </div>

            {/* Phase 2 Notice */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                    <strong>Phase 2 Coming Soon:</strong> Gemini AI integration for automatic data extraction from medical documents.
                </p>
            </div>

            {/* How it works */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">How it works</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                            1
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Upload or Scan</h4>
                            <p className="text-sm text-gray-500">Take a photo or upload your medical document</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                            2
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">AI Extraction</h4>
                            <p className="text-sm text-gray-500">Gemini AI extracts structured data from your document</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
                            3
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Encrypt & Store</h4>
                            <p className="text-sm text-gray-500">Data is encrypted with Lit Protocol and stored on IPFS</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
                >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
