'use client'

import { useState, useRef } from 'react'
import { extractMedicalData, ExtractedMedicalData } from '@/app/actions/gemini'
import { Camera, FileImage, FileText, Loader2, Upload, X } from 'lucide-react'

type DocumentScannerProps = {
    onDataExtracted: (data: ExtractedMedicalData, filePreview: string, mimeType: string) => void
}

export function DocumentScanner({ onDataExtracted }: DocumentScannerProps) {
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [isPdf, setIsPdf] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const processFile = async (file: File) => {
        // Validate file type (images and PDF)
        const isImage = file.type.startsWith('image/')
        const isPdfFile = file.type === 'application/pdf'

        if (!isImage && !isPdfFile) {
            setError('Please upload an image (JPG, PNG) or PDF file')
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB')
            return
        }

        setError(null)
        setIsPdf(isPdfFile)
        setFileName(file.name)

        // Create preview and extract data
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result as string
            setPreview(base64)

            // Extract data
            setLoading(true)

            try {
                const mimeType = isPdfFile ? 'application/pdf' : file.type
                const result = await extractMedicalData(base64, mimeType)

                if (result.success) {
                    onDataExtracted(result.data, base64, mimeType)
                } else {
                    setError(result.error)
                }
            } catch {
                setError('An unexpected error occurred. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragActive(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => {
        setDragActive(false)
    }

    const clearPreview = () => {
        setPreview(null)
        setError(null)
        setIsPdf(false)
        setFileName(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
            />

            <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="camera-capture"
            />

            {/* Upload Zone */}
            {!preview && !loading && (
                <div
                    className={`bg-white rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragActive
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-400'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
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
                        <label
                            htmlFor="file-upload"
                            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <FileImage className="h-5 w-5" />
                            Choose File
                        </label>
                        <label
                            htmlFor="camera-capture"
                            className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <Camera className="h-5 w-5" />
                            Use Camera
                        </label>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 animate-pulse">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        Analyzing Document...
                    </h2>
                    <p className="text-sm text-gray-500">
                        AI is extracting medical data from your document
                    </p>

                    {preview && (
                        <div className="mt-4">
                            {isPdf ? (
                                <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg border opacity-50">
                                    <FileText className="h-8 w-8 text-red-500" />
                                    <span className="text-sm text-gray-600">{fileName}</span>
                                </div>
                            ) : (
                                <img
                                    src={preview}
                                    alt="Document preview"
                                    className="rounded-lg max-h-48 mx-auto object-cover border opacity-50"
                                />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Preview with Error */}
            {preview && !loading && error && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="relative mb-4">
                        {isPdf ? (
                            <div className="flex items-center justify-center gap-2 p-6 bg-gray-50 rounded-lg border">
                                <FileText className="h-10 w-10 text-red-500" />
                                <span className="text-sm text-gray-700 font-medium">{fileName}</span>
                            </div>
                        ) : (
                            <img
                                src={preview}
                                alt="Document preview"
                                className="rounded-lg max-h-64 w-full object-cover border"
                            />
                        )}
                        <button
                            onClick={clearPreview}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>

                    {/* Error Message */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>

                    <button
                        onClick={() => {
                            setError(null)
                            if (preview) {
                                setLoading(true)
                                const mimeType = isPdf ? 'application/pdf' : 'image/jpeg'
                                extractMedicalData(preview, mimeType)
                                    .then(result => {
                                        if (result.success) {
                                            onDataExtracted(result.data, preview, mimeType)
                                        } else {
                                            setError(result.error)
                                        }
                                    })
                                    .finally(() => setLoading(false))
                            }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Error without Preview */}
            {error && !preview && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}
        </div>
    )
}
