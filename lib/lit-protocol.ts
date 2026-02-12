'use client'

import { LitNodeClient } from '@lit-protocol/lit-node-client'
import { LIT_NETWORK } from '@lit-protocol/constants'
import {
  encryptString,
  decryptToString,
} from '@lit-protocol/encryption'
import type {
  UnifiedAccessControlConditions,
  EncryptResponse,
  AccsDefaultParams,
} from '@lit-protocol/types'

// Singleton Lit client instance
let litNodeClient: LitNodeClient | null = null

/**
 * Get or create a Lit Protocol client instance.
 * Uses datil-test network as configured in .env.local
 */
export async function getLitClient(): Promise<LitNodeClient> {
  if (litNodeClient && litNodeClient.ready) {
    return litNodeClient
  }

  litNodeClient = new LitNodeClient({
    litNetwork: LIT_NETWORK.DatilTest,
    debug: false,
  })

  await litNodeClient.connect()
  return litNodeClient
}

/**
 * Disconnect the Lit client when no longer needed
 */
export async function disconnectLitClient(): Promise<void> {
  if (litNodeClient) {
    await litNodeClient.disconnect()
    litNodeClient = null
  }
}

/**
 * Build unified access control conditions that restrict decryption to the owner's wallet address.
 * This is a simple "only the owner can decrypt" condition.
 */
export function buildOwnerAccessConditions(
  walletAddress: string
): UnifiedAccessControlConditions {
  return [
    {
      conditionType: 'evmBasic' as const,
      contractAddress: '',
      standardContractType: '' as AccsDefaultParams['standardContractType'],
      chain: 'ethereum',
      method: '' as AccsDefaultParams['method'],
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=' as AccsDefaultParams['returnValueTest']['comparator'],
        value: walletAddress.toLowerCase(),
      },
    },
  ]
}

/**
 * Encrypt a string (typically JSON) using Lit Protocol.
 * No AuthSig/SessionSig needed for encryption — only for decryption.
 */
export async function encryptData(
  data: string,
  accessControlConditions: UnifiedAccessControlConditions
): Promise<EncryptResponse> {
  const client = await getLitClient()

  const encryptedData = await encryptString(
    {
      dataToEncrypt: data,
      unifiedAccessControlConditions: accessControlConditions,
    },
    client
  )

  return encryptedData
}

/**
 * Decrypt previously encrypted data using Lit Protocol.
 * Requires the user to authenticate (sign with wallet) to prove they meet access conditions.
 */
export async function decryptData(
  ciphertext: string,
  dataToEncryptHash: string,
  accessControlConditions: UnifiedAccessControlConditions,
  sessionSigs: Record<string, unknown>
): Promise<string> {
  const client = await getLitClient()

  const decryptedString = await decryptToString(
    {
      ciphertext,
      dataToEncryptHash,
      unifiedAccessControlConditions: accessControlConditions,
      chain: 'ethereum',
      sessionSigs: sessionSigs as Parameters<typeof decryptToString>[0]['sessionSigs'],
    },
    client
  )

  return decryptedString
}

export type { UnifiedAccessControlConditions, EncryptResponse }
