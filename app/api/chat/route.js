import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-pro-latest"; // Or another suitable model
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- Language Tutor Prompt ---
// Adjust TARGET_LANGUAGE and NATIVE_LANGUAGE as needed, or make them dynamic
const TARGET_LANGUAGE = "English";
const NATIVE_LANGUAGE = "English";

const TUTOR_PROMPT = `You are Luna, a friendly and patient ${TARGET_LANGUAGE} language tutor. The user is a native ${NATIVE_LANGUAGE} speaker trying to learn ${TARGET_LANGUAGE}.
Your goal is to have a natural conversation in ${TARGET_LANGUAGE} while helping the user practice.
- Engage in a friendly, encouraging conversation. Ask questions to keep it going.
- Speak primarily in ${TARGET_LANGUAGE}.
- If the user makes a mistake in ${TARGET_LANGUAGE} (grammar, vocabulary, pronunciation context), gently point it out *immediately* after their sentence.
- Explain the mistake clearly in ${NATIVE_LANGUAGE}.
- Provide the corrected ${TARGET_LANGUAGE} sentence.
- Keep your explanations concise.
- Then, continue the conversation naturally in ${TARGET_LANGUAGE}.
- If the user's input is not in ${TARGET_LANGUAGE} or is unclear, ask them to try speaking in ${TARGET_LANGUAGE}.
- Maintain a positive and supportive tone.
- Start the conversation by introducing yourself and asking the user how they are or what they want to talk about in ${TARGET_LANGUAGE}.`;

// Safety settings - adjust as needed
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Store conversation history per user session (in-memory for simplicity, consider a DB for production)
const conversationHistories = {}; // Use a more robust session management in production

export async function POST(request) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: "Missing message or sessionId" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Initialize history if it's a new session
    if (!conversationHistories[sessionId]) {
      conversationHistories[sessionId] = [
        { role: "user", parts: [{ text: TUTOR_PROMPT }] }, // Start with the system prompt
        { role: "model", parts: [{ text: `¡Hola! Soy Luna, tu tutora de ${TARGET_LANGUAGE}. ¿Cómo estás? ¿De qué te gustaría hablar hoy?` }] } // Initial greeting
      ];
    }

    // Add user message to history
    conversationHistories[sessionId].push({ role: "user", parts: [{ text: message }] });

    const chat = model.startChat({
        history: conversationHistories[sessionId].slice(0, -1), // Send history *before* the current user message
        generationConfig: {
            maxOutputTokens: 300, // Adjust as needed
        },
        safetySettings,
    });

    const result = await chat.sendMessage(message); // Send the latest user message
    const response = result.response;
    const aiMessage = response.text();

    // Add AI response to history
    conversationHistories[sessionId].push({ role: "model", parts: [{ text: aiMessage }] });

    // Optional: Limit history size to prevent excessive token usage
    if (conversationHistories[sessionId].length > 20) { // Keep last 20 turns (adjust)
        conversationHistories[sessionId] = conversationHistories[sessionId].slice(-20);
    }


    return new Response(JSON.stringify({ response: aiMessage }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Gemini API error:", error);
    // Check for specific blocked content errors
     if (error.message.includes('SAFETY')) {
       return new Response(JSON.stringify({ error: "Response blocked due to safety settings.", details: error.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
     }
    return new Response(JSON.stringify({ error: "Failed to communicate with AI", details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Optional: Add a GET handler or other methods if needed
export async function GET() {
  return new Response(JSON.stringify({ message: "API is running. Use POST to chat." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
} 