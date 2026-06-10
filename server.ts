import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// REST API for Formula Troubleshooting and Real-Time Feedback
app.post("/api/troubleshoot", async (req, res) => {
  try {
    const { formula, instruction, cellGridValues, expectedValue, errorMsg } = req.body;

    if (!formula) {
       return res.status(400).json({ error: "Formula is required for analysis." });
    }

    const client = getGeminiClient();

    const systemPrompt = `You are an expert Excel & Spreadsheet Educator and Tutor on GridAcademy. 
Your tone is incredibly encouraging, warm, highly supportive, and professional. 
The user is trying to write an Excel formula for a specific challenge.
Your goal is to troubleshoot the formula, point out exactly where the syntax or logic error lies, and explain how to fix it step-by-step.
Keep your explanation relatively concise but detailed enough to learn from. Emphasize learning the 'why' rather than just copy-pasting.

Return your response in standard Markdown. Use formatting like code blocks \`=SUM(A1:A3)\` and bullet points for high legibility.`;

    const userPrompt = `
**Mission details:**
- **Goal Exercise**: "${instruction}"
- **Target Cell Expected Value**: "${expectedValue || 'N/A'}"
- **Current Spreadsheet State**: ${JSON.stringify(cellGridValues || {})}
- **User's Entered Formula**: \`${formula}\`
${errorMsg ? `- **Grid Evaluator Error**: "${errorMsg}"` : ''}

**Please provide:**
1. A brief 1-sentence friendly validation or recognition of their attempt.
2. A clear breakdown of what is wrong with the formula (e.g., misspelled name, incorrect range formatting, mismatched parentheses, bad quote characters, wrong column index in VLOOKUP, or wrong function choice).
3. The correct formula representation in a prominent code block.
4. Active, short pedagogical summary of how that function operates so they master the concept.`;

    const result = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2
      }
    });

    const advice = result.text || "No response received from Gemini.";
    return res.json({ advice });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    return res.status(500).json({ 
      error: "Could not fetch AI advice.", 
      message: err.message,
      needApiKey: !process.env.GEMINI_API_KEY 
    });
  }
});

// Expert Excel Conversational Q&A / Tutor Router
app.post("/api/tutor-chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const client = getGeminiClient();

    // Map client messages to Gemini content format. Use last 6 messages for context
    const recentMessages = messages.slice(-6);
    
    const contents = recentMessages.map((m: any) => {
      return m.role === "user" ? m.content : m.content;
    });

    const systemPrompt = `You are "Gridy", the friendly AI Spreadsheet Coach.
You make learning spreadsheets, formulas (SUM, VLOOKUP, INDEX MATCH, IF, COUNTIF), pivot tables, and data cleaning simple and engaging.
Always format your answers with clean Markdown, bold headers, and elegant lists. Use code blocks for all formula examples.
Explain complex formulas with step-by-step logic traces (e.g., VLOOKUP requires searching the first column, matching the value, then counting cols to the right).
Maintain a fun, encouraging attitude. Use 1 or 2 spreadsheet emojis (like 📊, 📈, 🧮, 💻) appropriately. No AI system descriptions or developer logs!`;

    // Let's formulate a standard chat query or call generateContent with full text history
    let combinedPrompt = "An interaction with " + systemPrompt + "\n\n";
    recentMessages.forEach((m: any) => {
      combinedPrompt += `${m.role === 'user' ? 'User' : 'Coach Gridy'}: ${m.content}\n\n`;
    });
    combinedPrompt += "Coach Gridy:";

    const result = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: combinedPrompt,
      config: {
        temperature: 0.7
      }
    });

    return res.json({ response: result.text || "No reply generated." });
  } catch (err: any) {
    console.error("Tutor chat error:", err);
    return res.status(500).json({ 
      error: "Could not fetch tutor response.", 
      message: err.message,
      needApiKey: !process.env.GEMINI_API_KEY 
    });
  }
});

// Mount Vite in development, serve static in production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Excel Learning Server running on http://localhost:${PORT}`);
  });
};

startServer();
