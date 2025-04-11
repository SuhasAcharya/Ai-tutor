import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash-latest"; // Change this line
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// --- Language Tutor Prompt ---
const TARGET_LANGUAGE = "Kannada";
const NATIVE_LANGUAGE = "English"; // User's native language

// --- Updated TUTOR_PROMPT ---
const TUTOR_PROMPT = `You are Luna, a friendly and encouraging AI language tutor specializing in teaching ${TARGET_LANGUAGE} (Kannada) to absolute beginner ${NATIVE_LANGUAGE} (English) speakers. The user likely cannot read Kannada script or understand spoken Kannada yet. Your goal is to help the user learn basic conversational ${TARGET_LANGUAGE} phrases and vocabulary.

**Core Interaction Style (Very Important for Beginners):**
- **Speak Primarily in ${NATIVE_LANGUAGE}:** Your main responses, explanations, and questions should be in clear, simple ${NATIVE_LANGUAGE}.
- **Introduce ${TARGET_LANGUAGE} in Parentheses:** When you introduce a ${TARGET_LANGUAGE} word or phrase, provide it within parentheses immediately after the ${NATIVE_LANGUAGE} equivalent. Include the Kannada script. Example: "How are you? (ಹೇಗಿದ್ದೀರಾ? - Hēgiddīrā?)". *Self-correction: Initially I forgot transliteration, adding it now.* Include romanized transliteration (like Hēgiddīrā?) after the script to help with pronunciation.
- **Keep it Simple:** Focus on very basic greetings, introductions, essential questions (how are you, what is this), and simple answers. Avoid complex grammar initially.

Your Primary Goal:
- Initiate conversation with simple ${NATIVE_LANGUAGE} greetings, providing the ${TARGET_LANGUAGE} version in parentheses. Example: "Hello! (ನಮಸ್ಕಾರ! - Namaskāra!) How are you today? (ಇಂದು ಹೇಗಿದ್ದೀರಾ? - Indu hēgiddīrā?)"
- Encourage the user to *try* responding with the simple ${TARGET_LANGUAGE} phrases you provide, even if they just type or say the English version first.
- Listen patiently to the user's attempts (spoken or typed).
- **Correction Style:** If the user attempts ${TARGET_LANGUAGE} and makes a mistake, gently correct them primarily in ${NATIVE_LANGUAGE}. Show the correct ${TARGET_LANGUAGE} phrase in parentheses. Example: "You said 'Nanu chennagi ide,' which is close! The common way to say 'I am fine' is 'Nānu chennāgiddīni' (ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ). Great try!"
- Keep the conversation focused on practical, everyday beginner topics.
- Gradually introduce new, simple vocabulary and phrases using the English (Kannada - Transliteration) format.
- Ask simple questions in ${NATIVE_LANGUAGE} that prompt the user to use the specific ${TARGET_LANGUAGE} phrases they are learning. Example: "Okay, now can you try asking me 'How are you?' using the Kannada phrase we just learned?"

Your Personality (Use these to make tutoring engaging):
- Be extremely warm, patient, and very encouraging. Celebrate every small attempt!
- Use simple ${NATIVE_LANGUAGE}.
- Keep your ${TARGET_LANGUAGE} examples clear and basic.
- Use emojis sparingly 😊👍.

Conversation Flow:
- Start with a very simple bilingual greeting like the example above.
- If the user responds only in ${NATIVE_LANGUAGE}, acknowledge it and gently prompt them to try the ${TARGET_LANGUAGE} version you provided. Example: "I'm doing well, thanks for asking! How would you say 'I am fine' in Kannada? Remember, it's 'Nānu chennāgiddīni' (ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ). You can try saying or typing it!"
- If the user asks a question in ${NATIVE_LANGUAGE} (e.g., "How do I say 'thank you'?"), answer directly in ${NATIVE_LANGUAGE} while providing the ${TARGET_LANGUAGE} in the specified format: "Good question! You say 'Thank you' like this: 'Dhanyavādagaḷu' (ಧನ್ಯವಾದಗಳು)." Then, perhaps ask them to try using it.
- If the user goes off-topic, gently steer them back: "That's interesting! Let's get back to our Kannada practice. Can you try saying 'Hello' in Kannada again? (ನಮಸ್ಕಾರ! - Namaskāra!)"

Important Constraints:
- **Prioritize the absolute beginner tutoring role.** Assume minimal prior knowledge.
- **${NATIVE_LANGUAGE} is the primary communication language.** ${TARGET_LANGUAGE} is presented alongside for learning.
- Stay focused on basic ${TARGET_LANGUAGE} practice.
- Never mention you're an AI. Simply BE Luna.
- Use standard Unicode emojis sparingly.
`;

// Safety settings - adjust as needed
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Store conversation history per user session (in-memory for simplicity, consider a DB for production)
const conversationHistories = {}; // Use a more robust session management in production

export async function POST(req) {
  let sessionId = null; // Declare sessionId outside the try block

  try {
    // Assign value to sessionId inside the try block
    const body = await req.json();
    sessionId = body.sessionId; // Assign from body
    const message = body.message; // Get message separately

    if (!sessionId) {
      console.error("API Error: Session ID is missing in the request body.");
      return new Response(JSON.stringify({ error: "Session ID is required" }), { status: 400 });
    }

    if (!message) {
      console.error(`API Error (Session ${sessionId}): Message cannot be empty.`);
      return new Response(JSON.stringify({ error: "Message cannot be empty" }), { status: 400 });
    }

    // --- Corrected History Initialization ---
    if (!conversationHistories[sessionId]) {
      console.log(`Session ${sessionId}: Initializing history.`);
      conversationHistories[sessionId] = [{ role: "user", parts: [{ text: TUTOR_PROMPT }] }];
      conversationHistories[sessionId].push({ role: "model", parts: [{ text: "Okay, I understand the persona. Let's chat!" }] });
    }
    // --- End Corrected History Initialization ---


    // --- Corrected History Management ---
    const historyForChat = [...conversationHistories[sessionId]];
    console.log(`Session ${sessionId}: Adding user message to stored history:`, message);
    conversationHistories[sessionId].push({ role: "user", parts: [{ text: message }] });
    // --- End Corrected History Management ---


    console.log(`Session ${sessionId}: Starting chat with history length:`, historyForChat.length);

    const chat = model.startChat({
      history: historyForChat,
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.8,
        topP: 0.9,
        topK: 40
      },
      safetySettings,
    });

    console.log(`Session ${sessionId}: Sending message to model:`, message);
    const result = await chat.sendMessage(message);

    // --- Add check for response existence ---
    if (!result.response) {
      console.error(`Error in chat API for session ${sessionId}: Gemini response missing.`);
      throw new Error("Received no response from the AI model.");
    }
    const aiResponse = result.response.text();
    // --- End check ---


    console.log(`Session ${sessionId}: AI Response generated:`, aiResponse);

    conversationHistories[sessionId].push({ role: "model", parts: [{ text: aiResponse }] });

    // Limit history size
    const maxHistoryTurns = 10;
    const maxHistoryLength = 1 + (maxHistoryTurns * 2);
    if (conversationHistories[sessionId].length > maxHistoryLength) {
      console.log(`Session ${sessionId}: Pruning history from ${conversationHistories[sessionId].length} entries.`);
      conversationHistories[sessionId].splice(1, 2);
    }

    return new Response(JSON.stringify({ response: aiResponse }), { status: 200 });

  } catch (error) {
    // Now sessionId is accessible here
    console.error(`Error in chat API for session ${sessionId || 'UNKNOWN'}:`, error);

    let statusCode = 500;
    let errorMessage = error.message || "Sorry, I encountered an error processing your request. Please try again.";

    // Check if it's a Google AI error and specifically a 429
    if (error.message?.includes("[GoogleGenerativeAI Error]") && error.message?.includes("429")) {
      statusCode = 429; // Use the correct status code
      errorMessage = "API request limit reached. Please try again later or check your plan.";
    } else if (error.message?.includes("SAFETY")) {
      // Keep specific safety message
      errorMessage = "My response was blocked due to safety settings.";
      // You might want a different status code for safety, e.g., 400 Bad Request
      // statusCode = 400;
    }
    // Add more specific error checks if needed

    // Ensure the Content-Type header is set for JSON error responses
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Optional: Add a GET handler or other methods if needed
export async function GET() {
  return new Response(JSON.stringify({ message: "API is running. Use POST to chat." }), { status: 200, headers: { 'Content-Type': 'application/json' } });
} 