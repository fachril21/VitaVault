import { PinataSDK } from 'pinata'

// Singleton Pinata client
let pinataClient: PinataSDK | null = null

/**
 * Get or create a Pinata SDK instance.
 */
function getPinataClient(): PinataSDK {
  if (pinataClient) return pinataClient

  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT

  if (!jwt) {
    throw new Error('NEXT_PUBLIC_PINATA_JWT is not set')
  }

  pinataClient = new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: 'gateway.pinata.cloud',
  })
  return pinataClient
}

export interface UploadResult {
  cid: string
  size: number
  timestamp: string
}

/**
 * Upload encrypted data to IPFS via Pinata.
 * The data should already be encrypted before calling this function.
 */
export async function uploadToIPFS(
  encryptedData: string,
  metadata: {
    userId: string
    filename: string
    documentType: string
  }
): Promise<UploadResult> {
  const pinata = getPinataClient()

  // Create a File from the encrypted data string
  const blob = new Blob([encryptedData], { type: 'application/octet-stream' })
  const file = new File([blob], `encrypted_${metadata.filename}`, {
    type: 'application/octet-stream',
  })

  const result = await pinata.upload.public
    .file(file)
    .name(`vitavault_${metadata.documentType}_${Date.now()}`)
    .keyvalues({
      userId: metadata.userId,
      documentType: metadata.documentType,
      originalFilename: metadata.filename,
      uploadedAt: new Date().toISOString(),
    })

  return {
    cid: result.cid,
    size: result.size,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Retrieve encrypted data from IPFS using a CID.
 * Returns the raw encrypted string data.
 */
export async function retrieveFromIPFS(cid: string): Promise<string> {
  const pinata = getPinataClient()

  const response = await pinata.gateways.public.get(cid)

  // The response data can be various types; handle appropriately
  if (typeof response.data === 'string') {
    return response.data
  }

  // If it's a Blob/File, read it as text
  if (response.data instanceof Blob) {
    return await response.data.text()
  }

  // If it's an object, stringify it
  return JSON.stringify(response.data)
}

/**
 * Unpin a file from IPFS (removes from Pinata).
 * Note: the file may still be available on IPFS through other nodes.
 */
export async function unpinFromIPFS(cid: string): Promise<void> {
  const pinata = getPinataClient()
  // List files to find the ID by CID, then delete
  const files = await pinata.files.public.list().cid(cid)
  if (files.files && files.files.length > 0) {
    await pinata.files.public.delete([files.files[0].id])
  }
}
