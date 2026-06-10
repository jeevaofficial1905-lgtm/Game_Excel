import React, { useState } from "react";
import { Compass, BookOpen, GraduationCap, CheckCircle, ChevronRight, Award, Trophy, Star } from "lucide-react";
import { Difficulty } from "../types";

interface StudyPathSelectionProps {
  currentPath: Difficulty | null;
  onSelectPath: (path: Difficulty) => void;
}

interface AssessmentQuestion {
  id: number;
  text: string;
  options: string[];
  correctIdx: number;
  weight: "Beginner" | "Intermediate" | "Advanced";
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    text: "Which of these is the correct way to start a formula to add cells A1 and A2?",
    options: [
      "A1 + A2",
      "SUM(A1, A1)",
      "=SUM(A1, A2)",
      "ADD A1 TO A2"
    ],
    correctIdx: 2,
    weight: "Beginner"
  },
  {
    id: 2,
    text: "Which formula outputs 'Yes' if B1 is greater than 100, and 'No' otherwise?",
    options: [
      "=IF(B1>100, Yes, No)",
      "=IF(B1>100, \"Yes\", \"No\")",
      "=CHECK(B1>100, \"Yes\", \"No\")",
      "=IF B1>100 THEN \"Yes\" ELSE \"No\""
    ],
    correctIdx: 1,
    weight: "Intermediate"
  },
  {
    id: 3,
    text: "What column index does VLOOKUP use to find values if your lookup range is column A and B, and you want to look up column B values?",
    options: [
      "Column Index = 1",
      "Column Index = 2",
      "Column Index = B",
      "Column Index = 0"
    ],
    correctIdx: 1,
    weight: "Advanced"
  }
];

export default function StudyPathSelection({ currentPath, onSelectPath }: StudyPathSelectionProps) {
  const [mode, setMode] = useState<"choose" | "assessment">("choose");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<Difficulty | null>(null);

  const handleAnswerSelect = (optionIdx: number) => {
    const updatedAnswers = [...userAnswers, optionIdx];
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate level recommendation
      let correctCount = 0;
      assessmentQuestions.forEach((q, idx) => {
        if (updatedAnswers[idx] === q.correctIdx) {
          correctCount++;
        }
      });

      let recommended: Difficulty = "Beginner";
      if (correctCount === 2) {
        recommended = "Intermediate";
      } else if (correctCount === 3) {
        recommended = "Advanced";
      }

      setAssessmentResult(recommended);
    }
  };

  const handleResetAssessment = () => {
    setMode("choose");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setAssessmentResult(null);
  };

  const currentQuestion = assessmentQuestions[currentQuestionIndex];

  return (
    <div id="path-selection-card" className="bg-white brutal-border-thick shadow-brutal-lg p-6 sm:p-8 rounded-2xl">
      
      {mode === "choose" && (
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Select Your Personalized Excel Track
            </h2>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm font-medium">
              Whether you are opening a spreadsheet for the very first time or designing advanced dashboards, we have configured a customized path for your speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Beginner Card */}
            <div 
              id="path-card-beginner"
              onClick={() => onSelectPath("Beginner")}
              className={`p-6 brutal-border transition-all flex flex-col justify-between ${
                currentPath === "Beginner" 
                  ? "bg-emerald-50/60 shadow-brutal border-slate-900 ring-2 ring-emerald-500" 
                  : "bg-white shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="bg-emerald-500 text-white w-12 h-12 brutal-border flex items-center justify-center mb-4 rotate-[-2deg]">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black tracking-tight uppercase text-slate-900">1. Absolute Beginner</h3>
                  {currentPath === "Beginner" && <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 brutal-border font-black">ACTIVE</span>}
                </div>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  Start from scratch. Learn cells, simple mathematical operations like total sum averages, string combinations, and spreadsheet navigations.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <span>Select Track</span>
                <ChevronRight className="w-4 h-4 text-slate-900" />
              </div>
            </div>

            {/* Intermediate Card */}
            <div 
              id="path-card-intermediate"
              onClick={() => onSelectPath("Intermediate")}
              className={`p-6 brutal-border transition-all flex flex-col justify-between ${
                currentPath === "Intermediate" 
                  ? "bg-indigo-50/60 shadow-brutal border-slate-900 ring-2 ring-indigo-500" 
                  : "bg-white shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="bg-indigo-500 text-white w-12 h-12 brutal-border flex items-center justify-center mb-4 rotate-[2deg]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black tracking-tight uppercase text-slate-900">2. Intermediate Analyst</h3>
                  {currentPath === "Intermediate" && <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 brutal-border font-black">ACTIVE</span>}
                </div>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  Go beyond math. Dive deep into conditional tests like IF statements, logical checks, string transformations, and employee indexes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <span>Select Track</span>
                <ChevronRight className="w-4 h-4 text-slate-900" />
              </div>
            </div>

            {/* Advanced Card */}
            <div 
              id="path-card-advanced"
              onClick={() => onSelectPath("Advanced")}
              className={`p-6 brutal-border transition-all flex flex-col justify-between ${
                currentPath === "Advanced" 
                  ? "bg-purple-50/60 shadow-brutal border-slate-900 ring-2 ring-purple-500" 
                  : "bg-white shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5"
              }`}
            >
              <div>
                <div className="bg-purple-500 text-white w-12 h-12 brutal-border flex items-center justify-center mb-4 rotate-[-1deg]">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black tracking-tight uppercase text-slate-900">3. Advanced Architect</h3>
                  {currentPath === "Advanced" && <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 brutal-border font-black">ACTIVE</span>}
                </div>
                <p className="text-slate-600 text-xs mt-3 leading-relaxed">
                  Formulas for scale. Master vertical search structures (VLOOKUP), peak thresholds (MAX/MIN), and conditional count metrics (COUNT).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-purple-600 font-bold text-xs uppercase tracking-wider">
                <span>Select Track</span>
                <ChevronRight className="w-4 h-4 text-slate-900" />
              </div>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t-2 border-slate-200 text-center">
            <span className="text-xs text-slate-400 block mb-3 font-semibold uppercase tracking-wider">Unsure where you stand?</span>
            <button
              id="start-assessment-btn"
              onClick={() => setMode("assessment")}
              className="inline-flex items-center space-x-2 text-xs font-black bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl brutal-border shadow-brutal transition-all active:translate-y-0.5 cursor-pointer uppercase tracking-tight"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Let AI Assess Your Level</span>
            </button>
          </div>
        </div>
      )}

      {mode === "assessment" && !assessmentResult && (
        <div className="max-w-xl mx-auto">
          <div className="mb-6 flex justify-between items-center bg-slate-100 px-4 py-2.5 brutal-border">
            <span className="text-xs font-black text-slate-700 font-sans uppercase tracking-tight">
              Diagnostic Assessment Checklist
            </span>
            <span className="text-xs font-black text-emerald-600 font-mono">
              Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
            </span>
          </div>

          <div className="mb-6">
            <span className="inline-block mb-1.5 text-[10px] font-black text-white uppercase tracking-wider bg-slate-900 px-2.5 py-1 brutal-border shadow-brutal-sm">
              Metric: {currentQuestion.weight} Capability
            </span>
            <h3 className="text-xl font-black text-slate-950 leading-tight mt-1">
              {currentQuestion.text}
            </h3>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                className="w-full text-left p-4 bg-white brutal-border shadow-brutal-sm hover:bg-emerald-50/35 hover:-translate-y-0.5 cursor-pointer transition-colors font-sans text-sm text-slate-900 focus:outline-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono bg-slate-900 text-white brutal-border w-6 h-6 flex items-center justify-center font-black text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-black text-slate-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <button onClick={handleResetAssessment} className="hover:text-slate-800 underline">
              Cancel Assessment
            </button>
            <span>Finish all quiz points to locate your perfect starting zone</span>
          </div>
        </div>
      )}

      {mode === "assessment" && assessmentResult && (
        <div id="assessment-result-content" className="max-w-md mx-auto text-center py-4">
          <div className="inline-flex bg-emerald-500 text-white w-16 h-16 brutal-border shadow-brutal items-center justify-center mb-6 rotate-[-4deg]">
            <Star className="w-8 h-8 fill-white text-white" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2">
            Recommendation: {assessmentResult} Track
          </h3>
          
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Based on your answers, our learning diagnostic suggests starting at the <strong className="text-emerald-600 capitalize font-black">{assessmentResult}</strong> level to solidify spreadsheet foundations and stack up XP.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => {
                onSelectPath(assessmentResult);
                setMode("choose");
              }}
              className="w-full bg-slate-950 text-white font-black text-xs uppercase py-4 rounded-xl brutal-border shadow-brutal hover:bg-emerald-600 transition-all cursor-pointer"
            >
              Enroll in {assessmentResult} Track
            </button>
            <button
              onClick={handleResetAssessment}
              className="w-full bg-white text-slate-700 border-2 border-slate-900 font-black text-xs uppercase py-3 rounded-xl transition-all hover:bg-slate-50 cursor-pointer"
            >
              Return and Pick Manually
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
