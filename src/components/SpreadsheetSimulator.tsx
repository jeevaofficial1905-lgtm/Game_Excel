import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle, HelpCircle, CornerDownLeft, Sparkles, HelpCircle as HelpIcon } from "lucide-react";
import { Exercise } from "../types";
import { evaluateFormula } from "../utils/formulaEvaluator";

interface SpreadsheetSimulatorProps {
  key?: string;
  exercise: Exercise;
  onSuccess: (scoreXp: number) => void;
  onFailure: (errorMessage: string) => void;
  onAskAI: (formula: string, cellValues: Record<string, string>) => any;
  aiIsLoading: boolean;
}

const COLUMNS = ["A", "B", "C", "D"];
const ROWS = [1, 2, 3, 4, 5, 6];

export default function SpreadsheetSimulator({
  exercise,
  onSuccess,
  onFailure,
  onAskAI,
  aiIsLoading
}: SpreadsheetSimulatorProps) {
  // Store spreadsheet state
  const [grid, setGrid] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<string>("B1");
  const [formulaBarInput, setFormulaBarInput] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Initialize spreadsheet contents whenever the exercise shifts
  useEffect(() => {
    // Merge predetermined lesson parameters on the grid
    const initial = { ...exercise.initialGrid };
    
    // Fill other cells of A-D, 1-6 with empty if not present
    COLUMNS.forEach(col => {
      ROWS.forEach(row => {
        const coord = `${col}${row}`;
        if (initial[coord] === undefined) {
          initial[coord] = "";
        }
      });
    });

    setGrid(initial);
    // Focus default target cell
    setActiveCell(exercise.targetCell);
    setFormulaBarInput(initial[exercise.targetCell] || "");
    setSuccess(false);
    setMessage(null);
  }, [exercise]);

  // Handle spreadsheet selection changes
  const handleCellClick = (cellCoord: string) => {
    setActiveCell(cellCoord);
    setFormulaBarInput(grid[cellCoord] || "");
  };

  // Sync formula bar typing with cell grid
  const handleFormulaInputChange = (val: string) => {
    setFormulaBarInput(val);
    setGrid(prev => ({
      ...prev,
      [activeCell]: val
    }));
  };

  // Sync grid inline cell typing with formula bar
  const handleGridCellChange = (cellCoord: string, val: string) => {
    setGrid(prev => ({
      ...prev,
      [cellCoord]: val
    }));
    if (activeCell === cellCoord) {
      setFormulaBarInput(val);
    }
  };

  // Helper: Evaluated outputs mapping
  const resolveViewValue = (coord: string) => {
    const rawVal = grid[coord] || "";
    if (rawVal.startsWith("=")) {
      // Evaluate actual cell output
      return evaluateFormula(rawVal, grid);
    }
    return rawVal;
  };

  // Evaluated grid values dictionary (for validation)
  const getEvaluatedGrid = () => {
    const evaluated: Record<string, string> = {};
    Object.keys(grid).forEach(coord => {
      const rawVal = grid[coord] || "";
      if (rawVal.startsWith("=")) {
        evaluated[coord] = evaluateFormula(rawVal, grid);
      } else {
        evaluated[coord] = rawVal;
      }
    });
    return evaluated;
  };

  // Validation Check triggering
  const handleSubmit = () => {
    setMessage(null);
    const activeFormula = grid[exercise.targetCell]?.trim() || "";
    
    if (!activeFormula) {
      setMessage({
        type: "error",
        text: `The target cell ${exercise.targetCell} is empty. Please enter your answer formula here!`
      });
      return;
    }

    if (!activeFormula.startsWith("=")) {
      setMessage({
        type: "error",
        text: "Spreadsheet formula syntax error: Formulas must always start with an equals sign (=)."
      });
      onFailure("Missing leading '=' operator.");
      return;
    }

    // Evaluate cell
    const evaluatedGrid = getEvaluatedGrid();
    const evaluatedValue = evaluatedGrid[exercise.targetCell];

    // Check if the output value is resolved and matches expected value
    const regex = new RegExp(exercise.correctFormulaPattern, "i");
    const formulasMatch = regex.test(activeFormula);

    const isValCorrect = String(evaluatedValue).trim().toUpperCase() === exercise.expectedValue.trim().toUpperCase();

    if (formulasMatch && isValCorrect) {
      setSuccess(true);
      setMessage({
        type: "success",
        text: exercise.successMessage || "Awesome job! You solved this lesson challenge correctly."
      });
      onSuccess(100); // Trigger successful XP point callback
    } else {
      // Offer AI troubleshooter option
      let failGuide = "";
      if (!isValCorrect) {
        failGuide = `Expected evaluated value is ${exercise.expectedValue}, but your formula returned "${evaluatedValue || 'nothing'}".`;
      } else {
        failGuide = `Your output matches, but you did not use the requested cell structure format/range (e.g. ${exercise.correctFormulaDesc}).`;
      }
      
      setMessage({
        type: "error",
        text: `Incorrect formula in ${exercise.targetCell}. ${failGuide} Need help troubleshooting? Use our real-time AI solver below!`
      });
      onFailure(failGuide);
    }
  };

  // Direct AI analysis request trigger on current state
  const handleRequestAITroubleshoot = () => {
    const activeFormula = grid[exercise.targetCell] || "";
    onAskAI(activeFormula, grid);
  };

  return (
    <div id="spreadsheet-simulator-box" className="bg-white brutal-border-thick shadow-brutal-lg overflow-hidden">
      
      {/* Title & Help Section */}
      <div className="bg-slate-100 border-b-2 border-slate-900 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] font-black text-white bg-slate-900 px-2.5 py-1 brutal-border shadow-brutal-sm uppercase font-mono tracking-wider">
            Active Simulator Exercise
          </span>
          <h3 className="text-xl font-black text-slate-950 tracking-tight uppercase mt-2.5">{exercise.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          {/* Action check button */}
          <button
            id="submit-formula-btn"
            onClick={handleSubmit}
            className="bg-slate-900 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-tight px-5 py-3 brutal-border shadow-brutal-sm cursor-pointer flex items-center space-x-1.5 transition-all active:translate-y-0.5"
          >
            <span>Submit Formula</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Instruction Text Box */}
      <div className="bg-emerald-50/50 border-b-2 border-slate-900 px-5 py-3.5 text-xs text-slate-700 flex items-start space-x-2.5">
        <HelpIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-950 uppercase tracking-wide text-[11px] font-black mr-1">Task:</strong> 
          <span className="font-semibold text-slate-700">{exercise.instruction}</span>
          <div className="text-[10px] text-slate-500 mt-2 italic font-mono bg-white inline-block px-1.5 py-0.5 brutal-border">
            Target cell should be <span className="font-black text-emerald-600">{exercise.targetCell}</span>
          </div>
        </div>
      </div>

      {/* Visual Formula Helper Bar (Excel lookalike) */}
      <div className="bg-white border-b-2 border-slate-900 px-3 py-2 flex items-center space-x-1.5">
        
        {/* Active cell indicator */}
        <div className="bg-white text-slate-950 font-mono text-xs font-black px-3.5 py-1.5 brutal-border min-w-[55px] text-center select-none shadow-brutal-sm uppercase">
          {activeCell}
        </div>

        {/* Separator icon */}
        <div className="text-slate-400 select-none font-bold py-1 font-mono">|</div>

        {/* Excel FX logo */}
        <div className="text-slate-900 select-none font-black italic text-base w-6 text-center select-none">
          fx
        </div>

        {/* Formula Input Box */}
        <input
          id="formula-bar-input"
          type="text"
          value={formulaBarInput}
          onChange={(e) => handleFormulaInputChange(e.target.value)}
          placeholder="Enter values or start with '=' to write a formula (e.g. =SUM(A1:A3))"
          className="flex-1 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-900 font-mono text-xs brutal-border px-3 py-2 outline-none transition-colors"
        />
      </div>

      {/* Actual Spreadsheet Cellular Grid Layout */}
      <div className="p-4 bg-white overflow-x-auto">
        <div className="min-w-[420px] brutal-border rounded overflow-hidden">
          
          {/* Header row (A, B, C...) */}
          <div className="flex h-8 bg-slate-100">
            {/* Zero coordinate corner cell */}
            <div className="w-11 excel-grid-header flex items-center justify-center font-bold text-slate-400 text-xs border-r border-b-2 border-slate-900 select-none">
              📊
            </div>
            {COLUMNS.map((col) => (
              <div key={col} className="flex-1 excel-grid-header">
                {col}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {ROWS.map((rowNum) => (
            <div key={rowNum} className="flex h-9 bg-white hover:bg-slate-50/40">
              {/* Row number header */}
              <div className="w-11 excel-grid-header flex items-center justify-center font-mono font-black border-b-0">
                {rowNum}
              </div>

              {/* Editable Cell components */}
              {COLUMNS.map((colChar) => {
                const coord = `${colChar}${rowNum}`;
                const isActive = activeCell === coord;
                const isTarget = coord === exercise.targetCell;
                const evaluatedVal = resolveViewValue(coord);
                const rawVal = grid[coord] || "";

                return (
                  <div
                    key={coord}
                    onClick={() => handleCellClick(coord)}
                    className={`flex-1 excel-grid-cell cursor-cell flex items-center transition-all ${
                      isActive 
                        ? "bg-emerald-50/25 ring-2 ring-slate-900 ring-inset z-10" 
                        : isTarget 
                          ? "bg-amber-50/30 border-amber-400 border-2" 
                          : "hover:bg-slate-100/30"
                    }`}
                  >
                    {isActive ? (
                      <input
                        type="text"
                        value={rawVal}
                        onChange={(e) => handleGridCellChange(coord, e.target.value)}
                        className="w-full h-full bg-transparent font-mono text-xs text-slate-900 font-bold border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="w-full flex justify-between items-center px-1">
                        <span className={`text-xs ${rawVal.startsWith("=") ? "font-black text-emerald-600 font-mono" : "text-slate-800 font-bold"}`}>
                          {evaluatedVal}
                        </span>
                        {isTarget && !rawVal && (
                          <span className="text-[8px] font-black text-amber-700 animate-pulse bg-amber-100 brutal-border-thick px-1 py-0.5 rounded-xs">
                            ENTER FORMULA
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>

      {/* Validation Message panel */}
      {message && (
        <div className={`p-4 border-t-2 border-slate-900 ${
          message.type === "success" 
            ? "bg-emerald-100 text-emerald-950 font-semibold" 
            : "bg-rose-100 text-rose-950"
        }`}>
          <div className="flex items-start space-x-2.5">
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-xs font-black leading-relaxed uppercase tracking-tight">{message.type === "success" ? "Solved!" : "Error Check"}</p>
              <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-800">{message.text}</p>
              
              {/* Trigger prompt option if incorrect and target formula exists */}
              {message.type === "error" && grid[exercise.targetCell] && (
                <div className="mt-3.5 text-xs">
                  <button
                    onClick={handleRequestAITroubleshoot}
                    disabled={aiIsLoading}
                    className="inline-flex items-center space-x-1.5 bg-rose-600 text-white hover:bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-tight brutal-border shadow-brutal-sm cursor-pointer transition-all active:translate-y-0.5 disabled:bg-rose-400"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiIsLoading ? "Analyzing formula..." : "Troubleshoot Formula with AI"}</span>
                  </button>
                  <span className="ml-2.5 text-rose-800 text-[10px] font-bold uppercase hidden sm:inline">Ask Coach Gridy to audit logic.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hints toggle container */}
      <div className="bg-slate-100 border-t-2 border-slate-900 px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          💡 Need a hand? Read the core hints or ask Gridy.
        </span>
        <div className="text-[10px] text-slate-900 font-mono font-black uppercase bg-white px-2.5 py-1 brutal-border shadow-brutal-sm">
          Hint: {exercise.hint}
        </div>
      </div>

    </div>
  );
}
