"use server"

import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"

const scanResultSchema = z.array(
  z.object({
    text: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    words: z.array(
      z.object({
        text: z.string(),
        case_id: z.string().nullable(), // Null if no case applies (e.g. punctuation or irrelevant words)
        explanation: z.string().optional(),
      })
    ),
  })
)

export type ScannedSentence = z.infer<typeof scanResultSchema>[number]

export async function scanLatinText(rawText: string) {
  const supabase = await createClient()

  // 1. Fetch valid cases to train the AI
  const { data: cases } = await supabase.from("grammatical_cases").select("id, name")
  
  if (!cases || cases.length === 0) {
    throw new Error("No grammatical cases found in the database. Please seed them first.")
  }

  // 2. Setup Gemini
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set")
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  // Use the specific model available in the user's project
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-pro",
  })

  // 3. Construct System Prompt
  const casesList = cases.map(c => `- ${c.name}: ${c.id}`).join("\n")
  
  const prompt = `
SYSTEM INSTRUCTIONS:
You are an expert Latin teacher and linguist. Your task is to analyze Latin texts and structure them for a learning app.

Input: A block of Latin text (one or more sentences).
Output: A JSON array of sentence objects.

For each sentence:
1. "text": The full sentence string.
2. "difficulty": Estimate "easy", "medium", or "hard".
3. "words": An array of every single word in the sentence (maintain order).

For each "word":
1. "text": The word itself.
2. "case_id": Analyze the grammatical function of the word in this specific context and assign the UUID of the matching case from the list below.
   - If the word is a Verb, use the UUID for "Verbum" or "Verb" if present.
   - If the word is a preposition, conjunction, or punctuation that doesn't fit a standard case, set "case_id" to null.
   - BE PRECISE. Latin morphology is ambiguous (e.g. -a can be Nom or Abl). Use the context to decide.
3. "explanation": A very brief (2-5 words) explanation of why this case was chosen (e.g. "Subject of est", "Direct object").

Available Cases (Name: UUID):
${casesList}

IMPORTANT: Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
User Input:
${rawText}
`

  // 4. Call AI
  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    let content = response.text()
    
    if (!content) throw new Error("No response from AI")

    // Clean up potential markdown formatting from older models
    content = content.replace(/```json/g, "").replace(/```/g, "").trim()

    // 5. Parse and Validate
    const json = JSON.parse(content)
    // Handle potential wrapper keys like { "sentences": [...] }
    const arrayData = Array.isArray(json) ? json : json.sentences || json.data
    
    if (!Array.isArray(arrayData)) {
      throw new Error("AI did not return an array")
    }

    return arrayData as ScannedSentence[]
  } catch (e: any) {
    console.error("AI Parse Error", e)
    // Throw the specific error message if available, otherwise generic
    const errorMessage = e.message || "Unknown error occurred"
    throw new Error(`Failed to process text with Gemini AI: ${errorMessage}`)
  }
}

export async function saveScannedSentences(chapterId: string, sentences: ScannedSentence[]) {
  const supabase = await createClient()
  
  // Verify permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Forbidden")

  const results = []

  for (const sent of sentences) {
    // 1. Create Sentence
    const { data: newSentence, error: sentError } = await supabase
      .from("sentences")
      .insert({
        text: sent.text,
        chapter_id: chapterId,
        difficulty: sent.difficulty
      })
      .select()
      .single()

    if (sentError) throw new Error(sentError.message)
    
    // 2. Create Annotations
    const annotations = sent.words
      .map((word, index) => {
        if (!word.case_id) return null
        return {
          sentence_id: newSentence.id,
          word_index: index,
          word_text: word.text,
          grammatical_case_id: word.case_id,
          explanation: word.explanation
        }
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)

    if (annotations.length > 0) {
      const { error: annError } = await supabase.from("word_annotations").insert(annotations)
      if (annError) throw new Error(annError.message)
    }

    results.push(newSentence)
  }

  return results
}
