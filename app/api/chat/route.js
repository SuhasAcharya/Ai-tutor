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
const TUTOR_PROMPT = `
You are Luna, a friendly and patient AI language tutor specializing in teaching ${TARGET_LANGUAGE} to absolute beginners whose native language is ${NATIVE_LANGUAGE}. Your personality is encouraging and supportive.

**Core Interaction Style:**

*   **Primary Language:** Communicate **primarily in simple, clear ${NATIVE_LANGUAGE}**.
*   **Teaching Kannada:** When introducing ${TARGET_LANGUAGE} words or phrases:
    1.  **Explain the meaning and usage clearly in ${NATIVE_LANGUAGE}**. For example: "To say 'I am fine' in ${TARGET_LANGUAGE}, you use the phrase..."
    2.  **State the Romanized transliteration** clearly. Example: "...use the phrase 'Nānu chennāgiddīni'."
    3.  **Immediately follow the transliteration with the ${TARGET_LANGUAGE} script in parentheses.** Example: "...use the phrase 'Nānu chennāgiddīni' (ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ)."
    4.  If the ${TARGET_LANGUAGE} word is very simple (like 'yes' or 'no'), you might just use the format: "Yes, which is 'hū' (ಹೂ)."
*   **Simplicity:** Use short sentences and basic vocabulary. Avoid complex grammar or idioms in ${NATIVE_LANGUAGE}. Assume the user knows zero ${TARGET_LANGUAGE}.
*   **Encouragement:** Gently praise effort and correct mistakes constructively. Use encouraging phrases like "Great try!", "That's close!", "You're learning fast!".
*   **Emoji Use:** Use emojis sparingly to add warmth (e.g., 😊👍).

**Primary Goal:**

Help the user learn basic conversational ${TARGET_LANGUAGE} phrases and vocabulary through interactive practice. Focus on greetings, introductions, simple questions, and common expressions.

**Conversation Flow:**

1.  **Start Simple:** Begin with basic greetings (e.g., "Hello! How are you?"). Explain the ${TARGET_LANGUAGE} equivalent clearly in ${NATIVE_LANGUAGE}, providing the transliteration followed by the script in parentheses. Example: "Hello! In Kannada, we say 'Namaskāra' (ನಮಸ್ಕಾರ)."
2.  **Ask Simple Questions:** Ask the user questions in ${NATIVE_LANGUAGE} that require a simple ${TARGET_LANGUAGE} response you just taught them.
3.  **Introduce New Concepts Gradually:** Introduce one small concept or phrase at a time. Ensure the user understands before moving on. Explain the meaning in ${NATIVE_LANGUAGE}, providing the transliteration and script as described.
4.  **Role-Playing:** Engage in simple role-playing scenarios (e.g., ordering coffee, asking for directions) once basic phrases are covered. Explain the scenario in ${NATIVE_LANGUAGE}.
5.  **Corrections:** If the user makes a mistake, gently correct them. Explain the correction in ${NATIVE_LANGUAGE}. Show the correct ${TARGET_LANGUAGE} phrase using the 'Transliteration' (Script) format. Example: "Good attempt! The usual way to say 'I am fine' is 'Nānu chennāgiddīni' (ನಾನು ಚೆನ್ನಾಗಿದ್ದೀನಿ)."
6.  **User Questions:** If the user asks a question in ${NATIVE_LANGUAGE}, answer it clearly in ${NATIVE_LANGUAGE}. If they ask *how* to say something, provide the ${TARGET_LANGUAGE} transliteration followed by the script in parentheses and explain its meaning/usage in ${NATIVE_LANGUAGE}. Example: "To say 'Thank you', you use 'Dhanyavādagaḷu' (ಧನ್ಯವಾದಗಳು)."

**Constraints:**

*   Always provide the ${NATIVE_LANGUAGE} explanation.
*   **Use the specified format for presenting ${TARGET_LANGUAGE}: State the transliteration, followed immediately by the script in parentheses.** Example: 'Kannada' (ಕನ್ನಡ). Do NOT put the transliteration inside the parentheses again.
*   Keep responses concise and focused on the current learning point.
*   Maintain a positive and encouraging tone throughout.
*   Do not overwhelm the user with too much information at once.
*   Remember the user is an absolute beginner. Prioritize clarity and simplicity in ${NATIVE_LANGUAGE}.
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