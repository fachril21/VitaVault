
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config({ path: '.env.local' })

async function checkModel(modelName: string) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: modelName })
  
  try {
    console.log(`Testing ${modelName}...`)
    const result = await model.generateContent('Hello')
    console.log(`✅ ${modelName} SUCCESS`)
    return true
  } catch (error: any) {
    console.log(`❌ ${modelName} FAILED: ${error.message?.split('\n')[0]}`)
    return false
  }
}

async function listModels() {
  const logFile = 'model_check_results.txt'
  const log = (msg: string) => {
    console.log(msg)
    fs.appendFileSync(logFile, msg + '\n')
  }

  // Clear log file
  fs.writeFileSync(logFile, '')

  log('--- Model Check Start ---')

  // Check specific variants
  const variants = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-exp', // Just in case
    'gemini-pro'
  ]

  for (const variant of variants) {
    await checkModel(variant)
  }

  log('\n--- Listing Models via REST ---')
  const key = process.env.GEMINI_API_KEY
  if (!key) {
      log('No API Key found!')
      return
  }
  
  try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
      const data = await response.json()
      
      if (data.models) {
          log('Available models:')
          data.models.forEach((m: any) => {
              log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`)
          })
      } else {
          log(`Failed to list models: ${JSON.stringify(data)}`)
      }
  } catch (e) {
      log(`REST API Error: ${e}`)
  }
}

listModels()
