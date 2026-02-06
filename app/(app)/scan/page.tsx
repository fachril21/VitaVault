'use client'

import { Upload, FileImage, Camera, X, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function ScanPage() {
    const [dragActive, setDragActive] = useState(false)

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Scan Document</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Upload or capture your medical records
                </p>
            </div>

            {/* Upload Zone */}
            <div
                className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragActive
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-400'
                    }`}
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => setDragActive(false)}
            >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4">
                    <Upload className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Drop your document
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    JPG, PNG, PDF up to 10MB
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all"
                    >
                        <FileImage className="h-5 w-5" />
                        Choose File
                    </button>
                    <button
                        className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 active:scale-[0.98] transition-all"
                    >
                        <Camera className="h-5 w-5" />
                        Use Camera
                    </button>
                </div>
            </div>

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

            {/* Phase Notice */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800">
                    <strong>Coming Soon:</strong> Full AI-powered document scanning with automatic data extraction.
                </p>
            </div>
        </div>
    )
}
