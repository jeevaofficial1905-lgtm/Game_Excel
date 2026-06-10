import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MessageSquare, HelpCircle, Send, BadgeIcon, AlertTriangle, Lightbulb, ChevronRight, Check } from "lucide-react";

// Robust, dependency-free custom parser to style Markdown blocks cleanly
function formatMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Code blocks
    if (line.trim().startsWith("```")) {
      return null; // Skip raw code markers
    }
    
    // Header tags
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="font-sans font-black text-slate-950 text-xs uppercase tracking-tight mt-4 mb-2 first:mt-0">
          {line.replace("### ", "")}
        </h4>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h3 key={idx} className="font-sans font-black text-xs text-emerald-800 mt-5 mb-2 first:mt-0 flex items-center space-x-1.5 uppercase">
          <ChevronRight className="w-4 h-4 text-emerald-600 stroke-[3]" />
          <span>{line.replace("## ", "")}</span>
        </h3>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h2 key={idx} className="font-sans font-black text-sm text-slate-950 uppercase tracking-tighter mt-6 mb-3 first:mt-0">
          {line.replace("# ", "")}
        </h2>
      );
    }

    // Inline lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const bulletContent = line.substring(2);
      return (
        <li key={idx} className="text-xs text-slate-700 ml-4 py-1 list-disc font-semibold leading-relaxed">
          {renderInlineCodes(bulletContent)}
        </li>
      );
    }

    // Standard lists with ordered indices
    const numListMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numListMatch) {
      return (
        <div key={idx} className="flex items-start space-x-2 py-1.5 pl-1">
          <span className="font-mono text-xs font-black text-emerald-600 shrink-0">{numListMatch[1]}.</span>
          <p className="text-xs text-slate-800 font-bold leading-relaxed">{renderInlineCodes(numListMatch[2])}</p>
        </div>
      );
    }

    // Empty lines
    if (line.trim() === "") return <div key={idx} className="h-2" />;

    // Blockquotes
    if (line.startsWith("> ")) {
      return (
        <blockquote key={idx} className="border-l-4 border-slate-900 bg-amber-50 px-3.5 py-2.5 my-3 text-xs text-slate-800 font-bold italic">
          {renderInlineCodes(line.replace("> ", ""))}
        </blockquote>
      );
    }

    // Fallback paragraph
    return (
      <p key={idx} className="text-xs text-slate-850 font-bold leading-relaxed mt-2.5 first:mt-0">
        {renderInlineCodes(line)}
      </p>
    );
  });
}

// Inline backtick highlighting helper
function renderInlineCodes(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const codeVal = part.slice(1, -1);
      return (
        <code key={i} className="font-mono font-black text-[10px] bg-slate-900 text-amber-300 px-1.5 py-0.5 brutal-border shadow-brutal-sm uppercase">
          {codeVal}
        </code>
      );
    }
    return part;
  });
}

interface FormulaTroubleshooterProps {
  currentAdvice: string | null;
  onClearAdvice: () => void;
  isLoadingAdvice: boolean;
}

export default function FormulaTroubleshooter({
  currentAdvice,
  onClearAdvice,
  isLoadingAdvice
}: FormulaTroubleshooterProps) {
  const [activeSubTab, setActiveSubTab] = useState<"audit" | "chat">("audit");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: `Hello! I'm **Coach Gridy**, your personal Excel tutor. 📊 

You can ask me anything about spreadsheets! For example:
- *How does the VLOOKUP formula work?*
- *Can you explain INDEX MATCH?*
- *What is a Pivot Table?*
- *How do I write nested IF statements?*

Type your questions below and let's master formulas together!`
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  // Sync tab active state when new spreadsheet advice lands
  useEffect(() => {
    if (currentAdvice) {
      setActiveSubTab("audit");
    }
  }, [currentAdvice]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    
    // Append to UI immediately
    const nextHistory = [...chatHistory, { role: "user" as const, content: userMsg }];
    setChatHistory(nextHistory);
    setChatLoading(true);

    try {
      const response = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory })
      });

      const data = await response.json();
      if (response.ok && data.response) {
        setChatHistory(prev => [...prev, { role: "model" as const, content: data.response }]);
      } else {
        setChatHistory(prev => [
          ...prev,
          { 
            role: "model" as const, 
            content: "⚠️ **Coach Gridy is temporarily offline.** Ensure your `GEMINI_API_KEY` is configured in **Settings > Secrets** to enable real-time replies!" 
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev,
        { 
          role: "model" as const, 
          content: "❌ Net connection failure. Please confirm that your server is running and try again." 
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div id="troubleshooter-panel" className="bg-white brutal-border-thick shadow-brutal-lg h-[540px] flex flex-col rounded-2xl">
      
      {/* Sub tabs header */}
      <div className="bg-slate-100 border-b-2 border-slate-900 px-4 pt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            id="audit-subtab"
            onClick={() => setActiveSubTab("audit")}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-tight transition-all flex items-center space-x-1.5 translate-y-[2px] z-10 ${
              activeSubTab === "audit"
                ? "bg-white text-slate-950 border-2 border-slate-900 border-b-0 shadow-brutal-sm"
                : "text-slate-500 hover:text-slate-950 border-2 border-transparent border-b-0"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Formula Auditor</span>
          </button>
          
          <button
            id="chat-subtab"
            onClick={() => setActiveSubTab("chat")}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-tight transition-all flex items-center space-x-1.5 translate-y-[2px] z-10 ${
              activeSubTab === "chat"
                ? "bg-white text-slate-950 border-2 border-slate-900 border-b-0 shadow-brutal-sm"
                : "text-slate-500 hover:text-slate-950 border-2 border-transparent border-b-0"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
            <span>Ask Coach Gridy Q&A</span>
          </button>
        </div>

        <span className="text-[10px] font-black text-slate-500 font-mono tracking-wider uppercase mb-2 hidden sm:inline">
          GridAcademy AI Services
        </span>
      </div>

      {/* Main Panel Content Container */}
      <div className="flex-1 overflow-y-auto p-5">
        
        {/* Tab 1: Formula Auditor results */}
        {activeSubTab === "audit" && (
          <div className="h-full flex flex-col justify-between">
            {isLoadingAdvice ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="border-4 border-slate-900 border-t-emerald-600 w-11 h-11 rounded-full animate-spin mb-4" />
                <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Analyzing Formula Structure...</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs font-semibold">
                  Coach Gridy is using Gemini to verify logical offsets, quote closures, syntax parameters, and range references.
                </p>
              </div>
            ) : currentAdvice ? (
              <div>
                <div className="bg-emerald-50/50 brutal-border p-4 mb-4 shadow-brutal-sm">
                  <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b-2 border-dashed border-emerald-250">
                    <span className="text-[10px] font-black text-white bg-emerald-600 px-2.5 py-1 brutal-border shadow-brutal-sm uppercase font-mono tracking-wider flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Active AI Diagnostic Output
                    </span>
                    <button
                      onClick={onClearAdvice}
                      className="text-[10px] text-slate-500 hover:text-slate-950 font-black uppercase tracking-tight underline"
                    >
                      Clear Audit Log
                    </button>
                  </div>
                  
                  <div className="space-y-1 font-sans">
                    {formatMarkdown(currentAdvice)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <div className="bg-slate-100 brutal-border p-4 mb-4 shadow-brutal-sm text-slate-400 rotate-[-1deg]">
                  <span className="text-3xl">🧮</span>
                </div>
                <h4 className="text-base font-black text-slate-950 uppercase tracking-tight mt-2">Auditor Status: Ready</h4>
                <p className="text-xs text-slate-650 font-medium leading-relaxed mt-1.5 max-w-sm">
                  Write cell formulas in the spreadsheet simulator above. If you make an error, submit your formula and click the <strong className="text-rose-600 font-extrabold uppercase bg-rose-50 px-1.5 py-0.5 brutal-border-sm">Troubleshoot Formula with AI</strong> button to load real-time corrective help here!
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md">
                  <div className="bg-white brutal-border p-3 shadow-brutal-sm">
                    <span className="text-[11px] font-black text-emerald-600 block uppercase tracking-tight">✔️ Auto Syntax Checks</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1 leading-snug">Identifies quote mismatches & wrong coordinate references easily.</span>
                  </div>
                  <div className="bg-white brutal-border p-3 shadow-brutal-sm">
                    <span className="text-[11px] font-black text-emerald-600 block uppercase tracking-tight">💡 Practical Lessons</span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-1 leading-snug">Explains how formulas operate so you absorb skills for life.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Conversation Box */}
        {activeSubTab === "chat" && (
          <div className="h-full flex flex-col justify-between">
            {/* Scrollable messages area */}
            <div className="space-y-4 mb-4 pr-1">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role !== "user" && (
                    <div className="w-8 h-8 bg-slate-900 border-2 border-slate-950 text-white font-black text-xs flex items-center justify-center font-mono shrink-0 shadow-brutal-sm rotate-[-4deg]">
                      G
                    </div>
                  )}
                  <div
                    className={`p-3.5 brutal-border text-xs leading-relaxed max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white font-bold shadow-brutal-sm"
                        : "bg-slate-50 text-slate-900 font-medium"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="font-sans font-bold">{msg.content}</p>
                    ) : (
                      <div className="space-y-1 leading-relaxed">
                        {formatMarkdown(msg.content)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-slate-900 text-white font-black text-xs flex items-center justify-center font-mono shrink-0 animate-pulse brutal-border shadow-brutal-sm">
                    ...
                  </div>
                  <div className="bg-slate-50 brutal-border p-3 rounded-2xl max-w-[80%] flex items-center space-x-1.5 shadow-brutal-sm">
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form at bottom of chat panel */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-4 border-t-2 border-slate-900">
              <input
                id="tutor-chat-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask e.g. How does AVERAGE handle empty cells?"
                className="flex-1 bg-slate-50 font-mono text-xs brutal-border px-4 py-3 outline-none transition-all focus:bg-white text-slate-900 font-bold"
                disabled={chatLoading}
              />
              <button
                id="send-chat-btn"
                type="submit"
                className="bg-slate-900 hover:bg-emerald-600 text-white p-3 brutal-border shadow-brutal-sm hover:shadow-brutal transition-all active:translate-y-0.5 cursor-pointer"
                disabled={chatLoading || !chatInput.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
