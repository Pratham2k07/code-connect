import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sends a message to the Gemini API securely.
 * 
 * @param {string} apiKey - The user's Google Generative AI API key.
 * @param {string} prompt - The user's raw message/prompt.
 * @param {Object} context - Context object containing active file data.
 * @param {Array} history - Previous conversation messages.
 * @param {Object} sandpackCallbacks - Object containing callbacks for file operations (e.g. editFile).
 * @returns {Promise<string>} - The AI's markdown response.
 */
export const askAntigravity = async (apiKey, prompt, context = {}, history = [], sandpackCallbacks = null) => {
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure it in the settings.");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const tools = [
      {
        functionDeclarations: [
          {
            name: "edit_file",
            description: "Create a new file or overwrite an existing file with new code. Use this to write code directly into the user's workspace.",
            parameters: {
              type: "OBJECT",
              properties: {
                filePath: {
                  type: "STRING",
                  description: "The absolute path of the file to edit or create (e.g., '/src/App.jsx'). Always start with a slash."
                },
                codeContent: {
                  type: "STRING",
                  description: "The full code content to write to the file."
                }
              },
              required: ["filePath", "codeContent"]
            }
          }
        ]
      }
    ];

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Fast, powerful, great for coding
      tools: tools,
      systemInstruction: `You are Antigravity, an expert 10x developer AI coding assistant integrated directly into the user's IDE.
You are helping the user build their project. Be concise, extremely technical, and provide high-quality code.
If the user asks you to build a feature or write code, use the edit_file tool to apply the changes directly to their workspace!
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

    let result = await chat.sendMessage(finalPrompt);
    
    // Check for function calls and execute them
    let functionCall = result.response.functionCalls && result.response.functionCalls()[0];
    
    while (functionCall) {
      if (functionCall.name === 'edit_file') {
        const { filePath, codeContent } = functionCall.args;
        
        let success = false;
        let message = '';
        
        if (sandpackCallbacks && sandpackCallbacks.editFile) {
          try {
            sandpackCallbacks.editFile(filePath, codeContent);
            success = true;
            message = `File ${filePath} updated successfully.`;
          } catch (e) {
            success = false;
            message = `Error writing to ${filePath}: ${e.message}`;
          }
        } else {
          success = false;
          message = "Failed to edit. Agentic features are currently not enabled by the UI.";
        }
        
        // Send the function result back to the model
        result = await chat.sendMessage([{
          functionResponse: {
            name: 'edit_file',
            response: { success, message }
          }
        }]);
        
        // See if the model wants to call another function
        functionCall = result.response.functionCalls && result.response.functionCalls()[0];
      } else {
        break;
      }
    }

    return result.response.text();
  } catch (error) {
    console.error("Antigravity AI Error:", error);
    throw error;
  }
};
