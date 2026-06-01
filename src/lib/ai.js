import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sends a message to the Gemini API securely.
 * 
 * @param {string} apiKey - The user's Google Generative AI API key.
 * @param {string} prompt - The user's raw message/prompt.
 * @param {Object} context - Context object containing active file data.
 * @param {Array} history - Previous conversation messages.
 * @returns {Promise<string>} - The AI's markdown response.
 */
export const askAntigravity = async (apiKey, prompt, context = {}, history = []) => {
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure it in the settings.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Fast, powerful, great for coding
      systemInstruction: `You are Antigravity, an expert 10x developer AI coding assistant integrated directly into the user's IDE.
You are helping the user build their project. Be concise, extremely technical, and provide high-quality code.
Always format your code blocks with the correct language markdown tags (e.g., \`\`\`javascript).
If the user references "this file" or asks about their code, use the ACTIVE FILE CONTEXT provided to understand what they are looking at.`
    });

    // Format history for Gemini SDK
    // Gemini expects { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.2, // Low temperature for deterministic, accurate code
      }
    });

    // Inject active file context invisibly into the user's prompt if context exists
    let finalPrompt = prompt;
    
    if (context.filename && context.code) {
      finalPrompt = `[ACTIVE FILE CONTEXT: The user is currently viewing/editing the file "${context.filename}".\n\nCode in this file:\n\`\`\`\n${context.code}\n\`\`\`]\n\nUser Message: ${prompt}`;
    }

    const result = await chat.sendMessage(finalPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Antigravity AI Error:", error);
    throw error;
  }
};
