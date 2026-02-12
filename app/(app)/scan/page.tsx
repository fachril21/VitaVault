'use client'

import { useState, useRef, useEffect } from 'react'
import { usePrivy, useCreateWallet } from '@privy-io/react-auth'
import { DocumentScanner } from '@/components/DocumentScanner'
import { ExtractedDataReview } from '@/components/ExtractedDataReview'
import { ExtractedMedicalData } from '@/app/actions/gemini'
import { encryptData, buildOwnerAccessConditions } from '@/lib/lit-protocol'
import { ArrowLeft, CheckCircle, Lock, Shield, Loader2, ExternalLink, Copy, Check, Wallet } from 'lucide-react'
import { toast } from 'sonner'

type ScanStep = 'upload' | 'review' | 'encrypting' | 'confirmed'

interface UploadResult {
    recordId: string
    ipfsCid: string
    timestamp: string
}

export default function ScanPage() {
    const { user, linkWallet } = usePrivy()
    const { createWallet } = useCreateWallet()
    const [step, setStep] = useState<ScanStep>('upload')
    const [extractedData, setExtractedData] = useState<ExtractedMedicalData | null>(null)
    const [filePreview, setFilePreview] = useState<string>('')
    const [fileMimeType, setFileMimeType] = useState<string>('')
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [encryptionProgress, setEncryptionProgress] = useState<string>('')
    const [copiedCid, setCopiedCid] = useState(false)
    const [showWalletPrompt, setShowWalletPrompt] = useState(false)
    const [pendingData, setPendingData] = useState<ExtractedMedicalData | null>(null)
    const [creatingWallet, setCreatingWallet] = useState(false)
    const walletPromptRef = useRef<HTMLDivElement>(null)
    const walletAddress = user?.wallet?.address

    // When wallet gets connected while prompt is showing, update UI
    useEffect(() => {
        if (walletAddress && showWalletPrompt) {
            toast.success('Wallet connected successfully!')
        }
    }, [walletAddress, showWalletPrompt])

    const handleDataExtracted = (data: ExtractedMedicalData, preview: string, mimeType: string) => {
        setExtractedData(data)
        setFilePreview(preview)
        setFileMimeType(mimeType)
        setStep('review')
    }

    const handleConfirm = async (editedData: ExtractedMedicalData) => {
        if (!user?.id) {
            setError('You must be logged in to save records.')
            return
        }

        setExtractedData(editedData)
        setStep('encrypting')
        setError(null)

        try {
            // Step 1: Get user's wallet address for access control
            setEncryptionProgress('Preparing encryption...')

            const currentWalletAddress = user.wallet?.address

            if (!currentWalletAddress) {
                // No wallet found — show wallet creation prompt + toast
                setPendingData(editedData)
                setShowWalletPrompt(true)
                setStep('review')
                toast.error('Wallet not connected', {
                    description: 'Please create or link a wallet to encrypt your data.',
                })
                // Scroll to wallet prompt after render
                setTimeout(() => {
                    walletPromptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 100)
                return
            }

            // Step 2: Build access control conditions
            setEncryptionProgress('Setting access controls...')
            const accessConditions = buildOwnerAccessConditions(currentWalletAddress)

            // Step 3: Encrypt the data (extracted data + file preview together)
            setEncryptionProgress('Encrypting your data...')
            const dataToEncrypt = JSON.stringify({
                extractedData: editedData,
                filePreview: filePreview,
                fileMimeType: fileMimeType,
            })

            const encryptedResult = await encryptData(dataToEncrypt, accessConditions)

            // Step 4: Upload to IPFS and save to database
            setEncryptionProgress('Uploading to IPFS...')

            const response = await fetch('/api/records/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    encryptedData: encryptedResult.ciphertext,
                    dataToEncryptHash: encryptedResult.dataToEncryptHash,
                    accessConditions: accessConditions,
                    documentType: editedData.document_type,
                    patientName: editedData.patient_name,
                    documentDate: editedData.date,
                    originalFilename: `scan_${new Date().toISOString().split('T')[0]}`,
                    extractedData: editedData,
                    tags: generateTags(editedData),
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const result = await response.json()

            setUploadResult({
                recordId: result.recordId,
                ipfsCid: result.ipfsCid,
                timestamp: result.timestamp,
            })

            setStep('confirmed')
        } catch (err) {
            console.error('Encryption/upload error:', err)
            setError(err instanceof Error ? err.message : 'Failed to encrypt and upload. Please try again.')
            setStep('review')
        }
    }

    const handleCancel = () => {
        setStep('upload')
        setExtractedData(null)
        setFilePreview('')
        setFileMimeType('')
        setError(null)
    }

    const handleNewScan = () => {
        setStep('upload')
        setExtractedData(null)
        setFilePreview('')
        setFileMimeType('')
        setUploadResult(null)
        setError(null)
    }

    const handleCopyCid = async () => {
        if (uploadResult?.ipfsCid) {
            await navigator.clipboard.writeText(uploadResult.ipfsCid)
            setCopiedCid(true)
            setTimeout(() => setCopiedCid(false), 2000)
        }
    }

    const handleCreateWallet = async () => {
        setCreatingWallet(true)
        try {
            await createWallet()
            setShowWalletPrompt(false)
            // Retry the confirm flow with the pending data
            if (pendingData) {
                handleConfirm(pendingData)
            }
        } catch (err) {
            console.error('Failed to create wallet:', err)
            setError('Failed to create wallet. Please try again.')
        } finally {
            setCreatingWallet(false)
        }
    }

    const handleLinkWallet = async () => {
        try {
            linkWallet()
        } catch (err) {
            console.error('Failed to link wallet:', err)
            setError('Failed to link wallet. Please try again.')
        }
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
                            {step === 'encrypting' && 'Encrypting & Saving'}
                            {step === 'confirmed' && 'Securely Stored'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {step === 'upload' && 'Upload or capture your medical records'}
                            {step === 'review' && 'Verify the extracted information'}
                            {step === 'encrypting' && 'Your data is being encrypted and stored'}
                            {step === 'confirmed' && 'Your document is encrypted on IPFS'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
                {['upload', 'review', 'confirmed'].map((s, i) => (
                    <div key={s} className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === s || step === 'encrypting' && s === 'confirmed'
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
                                className={`w-12 h-1 mx-1 rounded ${(step === 'review' && i === 0) || step === 'confirmed' || step === 'encrypting'
                                    ? 'bg-emerald-200'
                                    : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Wallet Prompt */}
            {showWalletPrompt && (
                <div ref={walletPromptRef} className={`mb-4 rounded-2xl p-5 border transition-all ${walletAddress
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                    }`}>
                    <div className="flex items-start gap-3 mb-4">
                        <div className={`p-2 rounded-lg shadow-sm ${walletAddress ? 'bg-emerald-100' : 'bg-white'
                            }`}>
                            {walletAddress ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <Wallet className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                                {walletAddress ? 'Wallet Connected' : 'Wallet Required'}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                                {walletAddress ? (
                                    <>Your wallet is ready. You can now encrypt and save your data securely.
                                        <span className="block mt-1 font-mono text-[10px] text-gray-400 break-all">
                                            {walletAddress}
                                        </span>
                                    </>
                                ) : (
                                    'A wallet is needed to encrypt your data with Lit Protocol. Create an embedded wallet or connect an existing one.'
                                )}
                            </p>
                        </div>
                    </div>
                    {walletAddress ? (
                        <button
                            onClick={() => {
                                setShowWalletPrompt(false)
                                if (pendingData) handleConfirm(pendingData)
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 active:scale-[0.98] transition-all"
                        >
                            <Lock className="h-4 w-4" />
                            Continue to Encrypt & Save
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateWallet}
                                disabled={creatingWallet}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {creatingWallet ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                                ) : (
                                    <><Wallet className="h-4 w-4" /> Create Wallet</>
                                )}
                            </button>
                            <button
                                onClick={handleLinkWallet}
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 active:scale-[0.98] transition-all"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Link Existing
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs text-red-600 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

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

            {/* Encrypting State */}
            {step === 'encrypting' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Securing Your Data
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {encryptionProgress}
                        </p>

                        {/* Progress Steps */}
                        <div className="max-w-xs mx-auto space-y-3">
                            {[
                                { label: 'Preparing encryption', icon: Shield },
                                { label: 'Setting access controls', icon: Lock },
                                { label: 'Encrypting data', icon: Shield },
                                { label: 'Uploading to IPFS', icon: ExternalLink },
                            ].map((progressStep, i) => {
                                const currentIndex = [
                                    'Preparing encryption...',
                                    'Setting access controls...',
                                    'Encrypting your data...',
                                    'Uploading to IPFS...',
                                ].indexOf(encryptionProgress)

                                const isComplete = i < currentIndex
                                const isCurrent = i === currentIndex

                                return (
                                    <div key={progressStep.label} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isComplete
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : isCurrent
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isComplete ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : isCurrent ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <progressStep.icon className="h-3 w-3" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${isCurrent ? 'text-gray-900 font-medium' : isComplete ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {progressStep.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmed State */}
            {step === 'confirmed' && (
                <div className="space-y-4">
                    {/* Success Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Securely Stored!
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Your medical document has been encrypted and stored on IPFS.
                        </p>

                        {/* Document Type Badge */}
                        {extractedData?.document_type && (
                            <div className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                                {extractedData.document_type.replace('_', ' ')}
                            </div>
                        )}
                    </div>

                    {/* Storage Details */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Shield className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Encryption Details</h3>
                                <p className="text-sm text-gray-600">
                                    Your data is protected with end-to-end encryption
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* IPFS CID */}
                            {uploadResult?.ipfsCid && (
                                <div className="bg-white/80 rounded-xl p-3">
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
                                        {uploadResult.ipfsCid}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600">🔐 Lit Protocol</span>
                                <span className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600">📦 IPFS Storage</span>
                                <span className="px-2 py-1 bg-white/80 rounded-full text-xs text-gray-600">🔑 Wallet Access</span>
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

/**
 * Generate search tags from extracted medical data
 */
function generateTags(data: ExtractedMedicalData): string[] {
    const tags: string[] = []

    if (data.document_type) tags.push(data.document_type)
    if (data.patient_name) tags.push(data.patient_name)

    if (data.diagnosis) {
        data.diagnosis.forEach(d => tags.push(d))
    }

    if (data.medications) {
        data.medications.forEach(m => tags.push(m.name))
    }

    if (data.tests) {
        data.tests.forEach(t => tags.push(t.name))
    }

    // Deduplicate and lowercase
    return [...new Set(tags.map(t => t.toLowerCase()))]
}
