import { Lesson } from "../types";

export const lessonsData: Lesson[] = [
  {
    id: "lesson-1",
    title: "1. The Magic of Totals (SUM)",
    description: "Learn how to instantly combine numbers in grids. SUM is the absolute bedrock of spreadsheets.",
    difficulty: "Beginner",
    category: "Basics",
    estimatedTime: "5 mins",
    quiz: [
      {
        id: "q-1-1",
        question: "How do all formulas in Excel start?",
        options: [
          "With an exclamation sign (!)",
          "With an equals sign (=)",
          "With the word SUM",
          "With a parenthesis ("
        ],
        correctAnswer: 1,
        explanation: "All formulas MUST begin with an equals sign (=) content. If skipped, Excel parses it as regular static text."
      },
      {
        id: "q-1-2",
        question: "What does the range reference 'A1:A4' signify?",
        options: [
          "Only cell A1 and cell A4",
          "A1 divided by A4",
          "All cells from A1 down through A4 inclusive",
          "None of the above"
        ],
        correctAnswer: 2,
        explanation: "The colon (:) is the Excel range operator, designating all adjacent cells within that boundary."
      }
    ],
    exercises: [
      {
        id: "ex-1-1",
        title: "Summing Q1 Sales",
        instruction: "Calculate the total sales for Q1 by entering `=SUM(A1:A3)` inside target cell B1.",
        hint: "Select cell B1, type `=SUM(A1:A3)` precisely, and hit Enter or click 'Submit Formula'.",
        targetCell: "B1",
        initialGrid: {
          "A1": "150",
          "A2": "320",
          "A3": "480",
          "B1": ""
        },
        correctFormulaPattern: "SUM\\(A1:A3\\)",
        correctFormulaDesc: "=SUM(A1:A3)",
        expectedValue: "950",
        successMessage: "Splendid! You successfully totaled Q1 sales. Check out your XP and badges unlocked!"
      }
    ]
  },
  {
    id: "lesson-2",
    title: "2. Finding Middle Ground (AVERAGE)",
    description: "Master summarizing datasets by using the AVERAGE function to find trends from multi-cell records.",
    difficulty: "Beginner",
    category: "Basics",
    estimatedTime: "6 mins",
    quiz: [
      {
        id: "q-2-1",
        question: "What does AVERAGE do if a cell inside the range is empty?",
        options: [
          "Calculates it as a zero, lowering the average",
          "Stops and returns an error (#VALUE!)",
          "Skips the cell entirely, calculating average based only on cells containing values",
          "Prompts the user to enter a value"
        ],
        correctAnswer: 2,
        explanation: "Excel skips empty cells when assessing averages, rather than incorrectly counting them as zeros."
      }
    ],
    exercises: [
      {
        id: "ex-2-1",
        title: "Computing Class Averages",
        instruction: "Use `=AVERAGE(A1:A4)` in cell A5 to discover the average score of our mock class.",
        hint: "Make sure you start with '=' and reference the correct cells in the column A.",
        targetCell: "A5",
        initialGrid: {
          "A1": "88",
          "A2": "95",
          "A3": "70",
          "A4": "83",
          "A5": ""
        },
        correctFormulaPattern: "AVERAGE\\(A1:A4\\)",
        correctFormulaDesc: "=AVERAGE(A1:A4)",
        expectedValue: "84",
        successMessage: "Perfect score! An average of 84 is calculated immediately. You're rolling through the Beginner path!"
      }
    ]
  },
  {
    id: "lesson-3",
    title: "3. Logical Operations (IF)",
    description: "Teach spreadsheets how to make decisions for you! IF checks conditions and returns specific outputs.",
    difficulty: "Intermediate",
    category: "Logical Tests",
    estimatedTime: "8 mins",
    quiz: [
      {
        id: "q-3-1",
        question: "What are the three parts (arguments) of an IF statement, in order?",
        options: [
          "Value, True result, False result",
          "Logical test, Value if True, Value if False",
          "Column name, Search Key, Index",
          "Start Range, End Range, Threshold"
        ],
        correctAnswer: 1,
        explanation: "Syntax is always: =IF(logical_test, value_if_true, value_if_false)."
      }
    ],
    exercises: [
      {
        id: "ex-3-1",
        title: "Onboarding Quality Checks",
        instruction: "We need cell B1 to output 'Pass' if score A1 is greater than or equal to 70, otherwise 'Fail'. Input formula: `=IF(A1>=70, \"Pass\", \"Fail\")` into target cell B1.",
        hint: "Double quotes are required around text outputs inside formulas! Enter: =IF(A1>=70, \"Pass\", \"Fail\")",
        targetCell: "B1",
        initialGrid: {
          "A1": "85",
          "B1": ""
        },
        correctFormulaPattern: "IF\\(A1\\s*(>=|>)\\s*70\\s*,\\s*[\"']Pass[\"']\\s*,\\s*[\"']Fail[\"']\\)",
        correctFormulaDesc: '=IF(A1>=70, "Pass", "Fail")',
        expectedValue: "Pass",
        successMessage: "Sensational logic! Since A1 (85) is >= 70, Excel displays 'Pass' correctly."
      }
    ]
  },
  {
    id: "lesson-4",
    title: "4. Looking up Secrets (VLOOKUP)",
    description: "Search down a table column to find a key, and pull corresponding information from that exact row.",
    difficulty: "Intermediate",
    category: "Lookup Relations",
    estimatedTime: "10 mins",
    quiz: [
      {
        id: "q-4-1",
        question: "What does the 'col_index_num' argument mean in VLOOKUP?",
        options: [
          "The column index in the entire sheet (e.g. Column A = 1)",
          "The number of rows down to search",
          "The column number of the value to return, counting from the first column of the selected range (left-to-right, starting at 1)",
          "The database row serial index"
        ],
        correctAnswer: 2,
        explanation: "VLOOKUP takes the index relative to the leftmost column of your selected key range, which counts as 1."
      }
    ],
    exercises: [
      {
        id: "ex-4-1",
        title: "Employee Salary Lookup",
        instruction: "In target cell C2, use VLOOKUP to find Employee ID 2's salary using range A1:B4 and column index 2. Type: `=VLOOKUP(2, A1:B4, 2, FALSE)`",
        hint: "Format is: =VLOOKUP(lookupValue, tableRange, returnColIndex, booleanExactMatch). Use =VLOOKUP(2, A1:B4, 2, FALSE)",
        targetCell: "C2",
        initialGrid: {
          "A1": "1", "B1": "55000",
          "A2": "2", "B2": "72000",
          "A3": "3", "B3": "85000",
          "A4": "4", "B4": "98000",
          "C1": "Salary Lookup ID 2:",
          "C2": ""
        },
        correctFormulaPattern: "VLOOKUP\\(\\s*2\\s*,\\s*A1:B4\\s*,\\s*2\\s*,\\s*FALSE\\s*\\)",
        correctFormulaDesc: "=VLOOKUP(2, A1:B4, 2, FALSE)",
        expectedValue: "72000",
        successMessage: "Brilliant database mapping! You successfully retrieved $72,000 for Employee 2."
      }
    ]
  },
  {
    id: "lesson-5",
    title: "5. Text Wrangling (CONCAT & UPPER)",
    description: "Combine text pieces together or change capitalization with built-in text manipulation operators.",
    difficulty: "Beginner",
    category: "Text",
    estimatedTime: "5 mins",
    exercises: [
      {
        id: "ex-5-1",
        title: "Cleaning Customer Names",
        instruction: "Join first name in A1 with last name in B1, separating with a space, using `=CONCAT(A1, \" \", B1)` in target cell C1.",
        hint: "Check your quotes. Enter: =CONCAT(A1, \" \", B1)",
        targetCell: "C1",
        initialGrid: {
          "A1": "Alan",
          "B1": "Turing",
          "C1": ""
        },
        correctFormulaPattern: "CONCAT\\(A1\\s*,\\s*[\"']\\s+[\"']\\s*,\\s*B1\\)",
        correctFormulaDesc: '=CONCAT(A1, " ", B1)',
        expectedValue: "Alan Turing",
        successMessage: "Excellent concat skills! You've successfully formatted names seamlessly."
      }
    ]
  },
  {
    id: "lesson-6",
    title: "6. Master of Stats (MAX, MIN & COUNT)",
    description: "Filter bulk datasets, analyze volumes, scan peaks, and measure totals in high data environments.",
    difficulty: "Advanced",
    category: "Aggregations",
    estimatedTime: "9 mins",
    exercises: [
      {
        id: "ex-6-1",
        title: "Peak Server Load scanning",
        instruction: "Analyze logs in A1:A4 to find the highest server CPU load dynamically. Use `=MAX(A1:A4)` in cell B2.",
        hint: "We are scanning cells A1 through A4. Type `=MAX(A1:A4)` into B2.",
        targetCell: "B2",
        initialGrid: {
          "A1": "45",
          "A2": "94",
          "A3": "72",
          "A4": "86",
          "B1": "Peak Capacity:",
          "B2": ""
        },
        correctFormulaPattern: "MAX\\(A1:A4\\)",
        correctFormulaDesc: "=MAX(A1:A4)",
        expectedValue: "94",
        successMessage: "Phenomenal aggregation! You found the peak CPU load (94) comfortably. You have unlocked Advanced status!"
      }
    ]
  }
];
