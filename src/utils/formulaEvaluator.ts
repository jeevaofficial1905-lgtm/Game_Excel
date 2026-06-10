// Simple Excel Formula Evaluator
// Simulates basic formulas: SUM, AVERAGE, MIN, MAX, COUNT, CONCAT, UPPER, LOWER, IF, VLOOKUP

function colToNumber(col: string): number {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + (col.charCodeAt(i) - 64);
  }
  return num;
}

function numberToCol(num: number): string {
  let col = "";
  while (num > 0) {
    const rem = (num - 1) % 26;
    col = String.fromCharCode(65 + rem) + col;
    num = Math.floor((num - rem) / 26);
  }
  return col;
}

// Expands range like "A1:B3" to ["A1", "A2", "A3", "B1", "B2", "B3"]
export function expandRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) return [rangeStr.trim().toUpperCase()];
  const start = parts[0].trim().toUpperCase();
  const end = parts[1].trim().toUpperCase();
  
  const startColMatch = start.match(/^([A-Z]+)/);
  const startRowMatch = start.match(/(\d+)$/);
  const endColMatch = end.match(/^([A-Z]+)/);
  const endRowMatch = end.match(/(\d+)$/);
  
  if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
    return [start];
  }
  
  const startCol = startColMatch[1];
  const startRow = parseInt(startRowMatch[1], 10);
  const endCol = endColMatch[1];
  const endRow = parseInt(endRowMatch[1], 10);
  
  const startColIndex = colToNumber(startCol);
  const endColIndex = colToNumber(endCol);
  
  const cells: string[] = [];
  const minCol = Math.min(startColIndex, endColIndex);
  const maxCol = Math.max(startColIndex, endColIndex);
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  for (let c = minCol; c <= maxCol; c++) {
    const colName = numberToCol(c);
    for (let r = minRow; r <= maxRow; r++) {
      cells.push(`${colName}${r}`);
    }
  }
  return cells;
}

// Splits arguments inside parentheses, respecting quotes and inner parentheses
function splitArguments(argsStr: string): string[] {
  const args: string[] = [];
  let current = "";
  let parenDepth = 0;
  let inDoubleQuote = false;
  let inSingleQuote = false;

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += char;
    } else if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += char;
    } else if (char === '(' && !inDoubleQuote && !inSingleQuote) {
      parenDepth++;
      current += char;
    } else if (char === ')' && !inDoubleQuote && !inSingleQuote) {
      parenDepth--;
      current += char;
    } else if (char === ',' && parenDepth === 0 && !inDoubleQuote && !inSingleQuote) {
      args.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    args.push(current.trim());
  }
  return args;
}

// Resolves a cell reference or returns input literal
function resolveValue(token: string, grid: Record<string, string>): any {
  const t = token.trim();
  if (!t) return "";

  // String literals
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.substring(1, t.length - 1);
  }

  // Boolean literals
  if (t.toUpperCase() === "TRUE") return true;
  if (t.toUpperCase() === "FALSE") return false;

  // Number literal
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    return parseFloat(t);
  }

  // Cell reference (A1, B12 etc)
  if (/^[A-Z]+\d+$/i.test(t)) {
    const cellValue = grid[t.toUpperCase()];
    if (cellValue === undefined) return "";
    
    // If cell contains another formula, resolve it recursively
    if (cellValue.startsWith("=")) {
      // Prevent infinite loops by restricting some depth
      return evaluateCellFormula(cellValue, grid, new Set([t.toUpperCase()]));
    }
    
    // Convert to number if numeric
    if (/^-?\d+(\.\d+)?$/.test(cellValue)) {
      return parseFloat(cellValue);
    }
    return cellValue;
  }

  return t;
}

// Internal recursive formula evaluator with cycle detection
function evaluateCellFormula(formula: string, grid: Record<string, string>, visited: Set<string>): any {
  const clean = formula.trim();
  if (!clean.startsWith("=")) return clean;

  const match = clean.match(/^=([A-Z]+)\((.*)\)$/i);
  if (!match) {
    return "#NAME?"; // Syntactically invalid formula structures
  }

  const funcName = match[1].toUpperCase();
  const argsStr = match[2];
  const rawArgs = splitArguments(argsStr);

  try {
    switch (funcName) {
      case "SUM": {
        let sum = 0;
        for (const arg of rawArgs) {
          if (arg.includes(":")) {
            const cells = expandRange(arg);
            for (const cell of cells) {
              if (visited.has(cell)) return "#REF!"; // Circular dependency
              const val = resolveValue(cell, grid);
              if (typeof val === "number") sum += val;
            }
          } else {
            const val = resolveValue(arg, grid);
            if (typeof val === "number") sum += val;
          }
        }
        return sum;
      }

      case "AVERAGE": {
        let sum = 0;
        let count = 0;
        for (const arg of rawArgs) {
          if (arg.includes(":")) {
            const cells = expandRange(arg);
            for (const cell of cells) {
              if (visited.has(cell)) return "#REF!";
              const val = resolveValue(cell, grid);
              if (typeof val === "number") {
                sum += val;
                count++;
              }
            }
          } else {
            const val = resolveValue(arg, grid);
            if (typeof val === "number") {
              sum += val;
              count++;
            }
          }
        }
        return count > 0 ? (sum / count) : 0;
      }

      case "MAX": {
        let maxVal = -Infinity;
        let hasValue = false;
        for (const arg of rawArgs) {
          if (arg.includes(":")) {
            const cells = expandRange(arg);
            for (const cell of cells) {
              if (visited.has(cell)) return "#REF!";
              const val = resolveValue(cell, grid);
              if (typeof val === "number") {
                maxVal = Math.max(maxVal, val);
                hasValue = true;
              }
            }
          } else {
            const val = resolveValue(arg, grid);
            if (typeof val === "number") {
              maxVal = Math.max(maxVal, val);
              hasValue = true;
            }
          }
        }
        return hasValue ? maxVal : 0;
      }

      case "MIN": {
        let minVal = Infinity;
        let hasValue = false;
        for (const arg of rawArgs) {
          if (arg.includes(":")) {
            const cells = expandRange(arg);
            for (const cell of cells) {
              if (visited.has(cell)) return "#REF!";
              const val = resolveValue(cell, grid);
              if (typeof val === "number") {
                minVal = Math.min(minVal, val);
                hasValue = true;
              }
            }
          } else {
            const val = resolveValue(arg, grid);
            if (typeof val === "number") {
              minVal = Math.min(minVal, val);
              hasValue = true;
            }
          }
        }
        return hasValue ? minVal : 0;
      }

      case "COUNT": {
        let count = 0;
        for (const arg of rawArgs) {
          if (arg.includes(":")) {
            const cells = expandRange(arg);
            for (const cell of cells) {
              if (visited.has(cell)) return "#REF!";
              const val = resolveValue(cell, grid);
              if (typeof val === "number" || (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== "")) {
                count++;
              }
            }
          } else {
            const val = resolveValue(arg, grid);
            if (typeof val === "number" || (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== "")) {
              count++;
            }
          }
        }
        return count;
      }

      case "CONCAT": {
        let concatStr = "";
        for (const arg of rawArgs) {
          const val = resolveValue(arg, grid);
          concatStr += String(val);
        }
        return concatStr;
      }

      case "UPPER": {
        if (rawArgs.length === 0) return "";
        const val = resolveValue(rawArgs[0], grid);
        return String(val).toUpperCase();
      }

      case "LOWER": {
        if (rawArgs.length === 0) return "";
        const val = resolveValue(rawArgs[0], grid);
        return String(val).toLowerCase();
      }

      case "IF": {
        if (rawArgs.length < 2) return "#VALUE?";
        const conditionStr = rawArgs[0];
        
        // Split condition by comparison operators: >=, <=, !=, >, <, =
        const opMatch = conditionStr.match(/(>=|<=|!=|>|<|=)/);
        if (!opMatch) {
          // Simple truthiness check of term
          const val = resolveValue(conditionStr, grid);
          const isTrue = Boolean(val);
          const idx = isTrue ? 1 : 2;
          return rawArgs[idx] !== undefined ? resolveValue(rawArgs[idx], grid) : "";
        }

        const op = opMatch[1];
        const splitIdx = conditionStr.indexOf(op);
        const lhsRaw = conditionStr.substring(0, splitIdx).trim();
        const rhsRaw = conditionStr.substring(splitIdx + op.length).trim();

        const lhs = resolveValue(lhsRaw, grid);
        const rhs = resolveValue(rhsRaw, grid);

        let testPassed = false;
        switch (op) {
          case ">=": testPassed = Number(lhs) >= Number(rhs); break;
          case "<=": testPassed = Number(lhs) <= Number(rhs); break;
          case "!=": testPassed = String(lhs) !== String(rhs); break;
          case ">": testPassed = Number(lhs) > Number(rhs); break;
          case "<": testPassed = Number(lhs) < Number(rhs); break;
          case "=": testPassed = String(lhs).toUpperCase() === String(rhs).toUpperCase(); break;
        }

        const chosenArg = testPassed ? rawArgs[1] : rawArgs[2];
        return chosenArg !== undefined ? resolveValue(chosenArg, grid) : (testPassed ? "TRUE" : "FALSE");
      }

      case "VLOOKUP": {
        // VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])
        if (rawArgs.length < 3) return "#VALUE?";
        const lookupVal = resolveValue(rawArgs[0], grid);
        const tableRange = rawArgs[1];
        const colIndex = parseInt(resolveValue(rawArgs[2], grid), 10);

        if (isNaN(colIndex) || colIndex < 1) return "#VALUE?";

        if (!tableRange.includes(":")) return "#REF!";
        
        // Expand entire range
        const cells = expandRange(tableRange);
        if (cells.length === 0) return "#REF!";

        // We need to parse cell structures to assemble into rows
        // e.g. A1:B4 -> Cols: A, B; Rows: 1, 2, 3, 4
        // Sort cells by row first, then column
        const cellCoords = cells.map(cell => {
          const match = cell.match(/^([A-Z]+)(\d+)$/);
          return {
            name: cell,
            col: match ? match[1] : "",
            row: match ? parseInt(match[2], 10) : 0,
            colNum: match ? colToNumber(match[1]) : 0
          };
        });

        // Unique rows and columns
        const rows = Array.from(new Set(cellCoords.map(c => c.row))).sort((a,b)=>a-b);
        const colNums = Array.from(new Set(cellCoords.map(c => c.colNum))).sort((a,b)=>a-b);

        // Grid width check
        if (colIndex > colNums.length) return "#REF!";

        // Iterate through rows
        for (const rowVal of rows) {
          const rowCells = cellCoords.filter(c => c.row === rowVal).sort((a,b)=>a.colNum - b.colNum);
          if (rowCells.length === 0) continue;
          
          // Row first cell value
          const keyCellName = rowCells[0].name;
          const keyVal = resolveValue(keyCellName, grid);

          // Check if keyCell matches lookupVal
          let isMatch = false;
          if (typeof lookupVal === "number" && typeof keyVal === "number") {
            isMatch = lookupVal === keyVal;
          } else {
            isMatch = String(lookupVal).trim().toLowerCase() === String(keyVal).trim().toLowerCase();
          }

          if (isMatch) {
            // Found matched row! Get column value using colIndex (1-based)
            const targetCellObj = rowCells[colIndex - 1];
            if (!targetCellObj) return "#REF!";
            return resolveValue(targetCellObj.name, grid);
          }
        }
        return "#N/A"; // Value not found
      }

      default:
        return "#NAME?"; // Function name unknown
    }
  } catch (err) {
    console.error("Evaluation Error:", err);
    return "#VALUE!";
  }
}

// Primary entry point for cell formula evaluation
export function evaluateFormula(formula: string, grid: Record<string, string>): string {
  const clean = formula.trim();
  if (!clean) return "";
  if (!clean.startsWith("=")) return clean;
  
  const result = evaluateCellFormula(clean, grid, new Set());
  return String(result);
}
