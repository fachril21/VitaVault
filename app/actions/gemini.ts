'use server'

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export type ExtractedMedicalData = {
  document_type: 'lab_report' | 'prescription' | 'diagnosis' | 'imaging' | 'other' | null
  patient_name: string | null
  date: string | null
  provider: {
    name: string | null
    facility: string | null
  } | null
  diagnosis: string[] | null
  medications: {
    name: string
    dosage: string | null
    frequency: string | null
    duration: string | null
  }[] | null
  tests: {
    name: string
    result: string | null
    unit: string | null
    reference_range: string | null
  }[] | null
  vital_signs: {
    blood_pressure: string | null
    heart_rate: string | null
    temperature: string | null
    weight: string | null
  } | null
  notes: string | null
  follow_up: string | null
}

export type ExtractionResult = 
  | { success: true; data: ExtractedMedicalData; confidence: number }
  | { success: false; error: string }

/**
 * Extracts JSON from Gemini response text using multiple strategies
 * Handles various formats: pure JSON, markdown blocks, text with JSON, etc.
 */
function extractJSON(text: string): string {
  // Strategy 1: Try direct parse (pure JSON response)
  try {
    JSON.parse(text)
    return text
  } catch (e) {
    // Check if parse error is due to truncation
    if (e instanceof SyntaxError && (e.message.includes('Unexpected end') || e.message.includes('Unterminated'))) {
      throw new Error('Response was truncated. The document may be too complex or contain too much data.')
    }
  }

  // Strategy 2: Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  
  // Try parsing cleaned text
  try {
    JSON.parse(cleaned)
    return cleaned
  } catch (e) {
    if (e instanceof SyntaxError && (e.message.includes('Unexpected end') || e.message.includes('Unterminated'))) {
      throw new Error('Response was truncated. The document may be too complex.')
    }
  }
  
  // Strategy 3: Extract from first '{' to last '}'
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const extracted = cleaned.substring(firstBrace, lastBrace + 1)
    
    // Validate it's parseable
    try {
      JSON.parse(extracted)
      return extracted
    } catch (e) {
      // Check if parse error is due to truncation
      if (e instanceof SyntaxError && (e.message.includes('Unexpected end') || e.message.includes('Unterminated'))) {
        throw new Error('Response was truncated. The document may be too complex.')
      }
    }
  }
  
  // Strategy 4: Use regex to find JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/)?.[0]
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch)
      return jsonMatch
    } catch (e) {
      if (e instanceof SyntaxError && (e.message.includes('Unexpected end') || e.message.includes('Unterminated'))) {
        throw new Error('Response was truncated. The document may be too complex.')
      }
    }
  }
  
  // If all strategies fail, throw the original text for debugging
  throw new Error(`Unable to extract valid JSON from response: ${text.substring(0, 200)}...`)
}

export async function extractMedicalData(
  fileBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ExtractionResult> {
  const schema = {
    description: "Extracted medical data from document",
    type: SchemaType.OBJECT,
    properties: {
      document_type: {
        type: SchemaType.STRING,
        enum: ["lab_report", "prescription", "diagnosis", "imaging", "other"],
        nullable: true
      },
      patient_name: { type: SchemaType.STRING, nullable: true },
      date: { type: SchemaType.STRING, nullable: true },
      provider: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING, nullable: true },
          facility: { type: SchemaType.STRING, nullable: true }
        },
        nullable: true
      },
      diagnosis: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        nullable: true
      },
      medications: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            dosage: { type: SchemaType.STRING, nullable: true },
            frequency: { type: SchemaType.STRING, nullable: true },
            duration: { type: SchemaType.STRING, nullable: true }
          },
          required: ["name"]
        },
        nullable: true
      },
      tests: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            result: { type: SchemaType.STRING, nullable: true },
            unit: { type: SchemaType.STRING, nullable: true },
            reference_range: { type: SchemaType.STRING, nullable: true }
          },
          required: ["name"]
        },
        nullable: true
      },
      vital_signs: {
        type: SchemaType.OBJECT,
        properties: {
          blood_pressure: { type: SchemaType.STRING, nullable: true },
          heart_rate: { type: SchemaType.STRING, nullable: true },
          temperature: { type: SchemaType.STRING, nullable: true },
          weight: { type: SchemaType.STRING, nullable: true }
        },
        nullable: true
      },
      notes: { type: SchemaType.STRING, nullable: true },
      follow_up: { type: SchemaType.STRING, nullable: true }
    },
    required: ["document_type", "patient_name", "date", "provider", "diagnosis", "medications", "tests", "vital_signs", "notes", "follow_up"]
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1, // Low temp for accuracy
      responseMimeType: 'application/json', // Force JSON output
      responseSchema: schema as any
    }
  })
  
  // Updated prompt to explicitly request pure JSON
  const prompt = `Extract medical information from this document and return ONLY a valid JSON object. Do not include any explanatory text, markdown formatting, or code blocks - just the raw JSON object.`

  try {
    // Extract base64 data (remove data:...;base64, prefix if present)
    const base64Data = fileBase64.includes(',') 
      ? fileBase64.split(',')[1] 
      : fileBase64

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ])
    
    const rawText = result.response.text()
    console.log('Gemini Raw Response:', rawText.substring(0, 500)) // Log first 500 chars
    
    // Use robust JSON extraction
    const cleanedJSON = extractJSON(rawText)
    const data = JSON.parse(cleanedJSON) as ExtractedMedicalData
    
    console.log('✅ Successfully extracted and parsed medical data')
    
    return { 
      success: true, 
      data,
      confidence: 0.9
    }
  } catch (error: unknown) {
    console.error('Gemini extraction error:', error)
    
    // Handle rate limits
    if (error instanceof Error && error.message?.includes('429')) {
      return { 
        success: false, 
        error: 'Rate limit exceeded. Please wait a moment.' 
      }
    }
    
    // Handle quota exceeded
    if (error instanceof Error && error.message?.includes('quota') || error instanceof Error && error.message?.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        error: 'API quota exceeded. Please try again later.'
      }
    }
    
    // Handle JSON parse errors with more context
    if (error instanceof SyntaxError || (error instanceof Error && error.message?.includes('JSON'))) {
      return {
        success: false,
        error: 'Failed to parse AI response. The document may be unclear or unsupported. Please try a clearer image.'
      }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to extract data. Please try again.' 
    }
  }
}
