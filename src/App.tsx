import React, { useState, useEffect } from "react";
import { 
  Award, Trophy, Zap, Compass, BookOpen, GraduationCap, 
  CheckCircle, ArrowRight, HelpCircle, RefreshCw, Star, 
  Sparkles, Check, ChevronRight, Play, AlertCircle, Info, BookMarked
} from "lucide-react";
import { UserProgress, Badge, Lesson, Difficulty } from "./types";
import { lessonsData } from "./data/lessons";
import Navbar from "./components/Navbar";
import StudyPathSelection from "./components/StudyPathSelection";
import SpreadsheetSimulator from "./components/SpreadsheetSimulator";
import Leaderboard from "./components/Leaderboard";
import FormulaTroubleshooter from "./components/FormulaTroubleshooter";

const ACADEMY_BADGES: Badge[] = [
  { id: "badge-compass", title: "Compass Cadet", description: "Completed onboarding and chosen a personalized learning track.", iconName: "Compass", colorClass: "bg-teal-500 border-teal-600 font-sans" },
  { id: "badge-sum", title: "Sum Sorcerer", description: "Successfully computed total values using the Excel SUM function.", iconName: "Sum", colorClass: "bg-emerald-500 border-emerald-600 font-sans" },
  { id: "badge-average", title: "Trend Analyzer", description: "Calculated middle-range parameters using the AVERAGE function.", iconName: "Average", colorClass: "bg-sky-500 border-sky-600 font-sans" },
  { id: "badge-if", title: "Logic Overlord", description: "Wrote conditional logic statements using IF clauses successfully.", iconName: "If", colorClass: "bg-orange-500 border-orange-600 font-sans" },
  { id: "badge-vlookup", title: "Data Explorer", description: "Connected vertical key indexes seamlessly using VLOOKUP.", iconName: "Vlookup", colorClass: "bg-purple-500 border-purple-600 font-sans" },
  { id: "badge-concat", title: "Text Weaver", description: "Joined raw cell names seamlessly with CONCAT.", iconName: "Concat", colorClass: "bg-indigo-500 border-indigo-600 font-sans" },
  { id: "badge-max", title: "Peak Investigator", description: "Identified capacity metrics across datasets using MAX.", iconName: "Max", colorClass: "bg-pink-500 border-pink-600 font-sans" }
];

const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  xp: 0,
  xpToNextLevel: 300,
  streak: 3,
  selectedPath: null,
  unlockedBadges: [],
  completedLessons: [],
  completedExercises: {},
  exerciseAttempts: {}
};

export default function App() {
  // Primary States
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [activeTab, setActiveTab] = useState<"lessons" | "leaderboard" | "tutor">("lessons");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("lesson-1");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState<Record<string, boolean>>({});

  // AI-driven troubleshooter logs
  const [currentAdvice, setCurrentAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);

  // Level up celebrate alert modal state
  const [celebrateLevel, setCelebrateLevel] = useState<number | null>(null);

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gridacademy_progress_v2");
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (err) {
        console.error("Local Storage parse error:", err);
      }
    }
  }, []);

  // Save progress changes
  const saveProgress = (updated: UserProgress) => {
    setProgress(updated);
    localStorage.setItem("gridacademy_progress_v2", JSON.stringify(updated));
  };

  // Reset Progress trigger
  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your level, streaks, and clear all unlocked badges?")) {
      saveProgress(DEFAULT_PROGRESS);
      setSelectedLessonId("lesson-1");
      setCurrentExerciseIndex(0);
      setQuizAnswers({});
      setShowQuizResults({});
      setCurrentAdvice(null);
      setActiveTab("lessons");
    }
  };

  // Study Path Enrollment Selection
  const handleEnrollPath = (path: Difficulty) => {
    const unlocked = [...progress.unlockedBadges];
    if (!unlocked.includes("badge-compass")) {
      unlocked.push("badge-compass");
    }

    const firstLessonOfPath = lessonsData.find(l => l.difficulty === path)?.id || "lesson-1";

    const updated = {
      ...progress,
      selectedPath: path,
      unlockedBadges: unlocked,
      xp: progress.xp + 50 // Give 50 starting XP
    };
    setSelectedLessonId(firstLessonOfPath);
    setCurrentExerciseIndex(0);
    assessXpLevelUp(updated);
  };

  // Track XP boundaries & handle levels
  const assessXpLevelUp = (data: UserProgress) => {
    let currentXp = data.xp;
    let currentLevel = data.level;
    let boundary = data.xpToNextLevel;
    let leveledUp = false;

    while (currentXp >= boundary) {
      currentXp -= boundary;
      currentLevel += 1;
      boundary = Math.floor(boundary * 1.25);
      leveledUp = true;
    }

    const updated = {
      ...data,
      xp: currentXp,
      level: currentLevel,
      xpToNextLevel: boundary
    };

    if (leveledUp) {
      setCelebrateLevel(currentLevel);
    }
    saveProgress(updated);
  };

  // Handle Exercise completion validation succeses
  const handleExerciseSuccess = (xpAward: number) => {
    const activeLesson = lessonsData.find(l => l.id === selectedLessonId);
    if (!activeLesson) return;

    const activeExercise = activeLesson.exercises[currentExerciseIndex];
    if (!activeExercise) return;

    // Check if already completed this exercise
    const isAlreadyCompleted = progress.completedExercises[activeExercise.id];
    
    // Mark completed lessons
    const updatedCompletedExercises = {
      ...progress.completedExercises,
      [activeExercise.id]: true
    };

    // Calculate badge unlocks based on active exercise
    const updatedUnlockedBadges = [...progress.unlockedBadges];
    const badgeMappings: Record<string, string> = {
      "ex-1-1": "badge-sum",
      "ex-2-1": "badge-average",
      "ex-3-1": "badge-if",
      "ex-4-1": "badge-vlookup",
      "ex-5-1": "badge-concat",
      "ex-6-1": "badge-max"
    };

    const targetBadgeId = badgeMappings[activeExercise.id];
    if (targetBadgeId && !updatedUnlockedBadges.includes(targetBadgeId)) {
      updatedUnlockedBadges.push(targetBadgeId);
    }

    // Check if all exercises of this lesson are done to check lesson complete
    const lessonExercisesIds = activeLesson.exercises.map(ex => ex.id);
    const allLessonDone = lessonExercisesIds.every(id => updatedCompletedExercises[id] || id === activeExercise.id);
    
    const updatedCompletedLessons = [...progress.completedLessons];
    if (allLessonDone && !updatedCompletedLessons.includes(selectedLessonId)) {
      updatedCompletedLessons.push(selectedLessonId);
    }

    const updated = {
      ...progress,
      completedExercises: updatedCompletedExercises,
      completedLessons: updatedCompletedLessons,
      unlockedBadges: updatedUnlockedBadges,
      xp: progress.xp + (isAlreadyCompleted ? 20 : xpAward) // Award 100 XP for first solve, 20 XP for reviews
    };

    assessXpLevelUp(updated);
  };

  const handleExerciseFailure = (errorGuide: string) => {
    // We can increment attempts state
    const activeLesson = lessonsData.find(l => l.id === selectedLessonId);
    if (!activeLesson) return;
    const activeExercise = activeLesson.exercises[currentExerciseIndex];
    if (!activeExercise) return;

    const updatedAttempts = {
      ...progress.exerciseAttempts,
      [activeExercise.id]: (progress.exerciseAttempts[activeExercise.id] || 0) + 1
    };

    saveProgress({
      ...progress,
      exerciseAttempts: updatedAttempts
    });
  };

  // AI auditor trigger
  const handleQueryAIAuditor = async (formula: string, gridValues: Record<string, string>) => {
    const activeLesson = lessonsData.find(l => l.id === selectedLessonId);
    if (!activeLesson) return;
    const activeExercise = activeLesson.exercises[currentExerciseIndex];
    if (!activeExercise) return;

    setIsLoadingAdvice(true);
    setCurrentAdvice(null);

    try {
      const response = await fetch("/api/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formula,
          instruction: activeExercise.instruction,
          cellGridValues: gridValues,
          expectedValue: activeExercise.expectedValue,
          errorMsg: progress.exerciseAttempts[activeExercise.id] > 0 ? "Values mismatch" : ""
        })
      });

      const data = await response.json();
      if (response.ok && data.advice) {
        setCurrentAdvice(data.advice);
      } else {
        setCurrentAdvice(`⚠️ **API Key Missing!** To activate real-time formula help:
1. Open the **Settings > Secrets** panel in the AI Studio UI.
2. Injected variable \`GEMINI_API_KEY\` handles this automatically.

*Meanwhile, here is the official formula hint to solve this challenge:*
Use code **\`${activeExercise.correctFormulaDesc}\`** in target cell **\`${activeExercise.targetCell}\`** to match expected result \`${activeExercise.expectedValue}\`.`);
      }
    } catch (err: any) {
      console.error(err);
      setCurrentAdvice("❌ Failed to contact the AI auditor. Please check if your network port is open or server is running.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  // Quiz evaluation
  const handleSelectQuizAnswer = (quizId: string, idx: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizId]: idx
    }));
  };

  const handleSubmitQuiz = (lessonId: string, quizId: string, correctIdx: number) => {
    const isCorrect = quizAnswers[quizId] === correctIdx;
    
    setShowQuizResults(prev => ({
      ...prev,
      [quizId]: true
    }));

    if (isCorrect) {
      // Award 50 XP for right answer
      const updated = {
        ...progress,
        xp: progress.xp + 50
      };
      assessXpLevelUp(updated);
    }
  };

  const activeLesson = lessonsData.find(l => l.id === selectedLessonId) || lessonsData[0];
  const activeExercise = activeLesson.exercises[currentExerciseIndex] || activeLesson.exercises[0];

  // Filter lessons selection based on selected visual tracks
  const filteredLessons = lessonsData.filter(l => {
    if (!progress.selectedPath) return true;
    return l.difficulty === progress.selectedPath;
  });

  return (
    <div id="gridacademy-app-root" className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
      
      {/* Navigation Layer */}
      <Navbar
        progress={progress}
        onResetProgress={handleResetProgress}
        onNavigate={(tab) => {
          setActiveTab(tab);
          // Auto clear auditor result if leaving focus
          if (tab !== "lessons") setCurrentAdvice(null);
        }}
        activeTab={activeTab}
      />

      {/* Main viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Onboarding block if study track hasn't been selected yet */}
        {progress.selectedPath === null ? (
          <div className="max-w-4xl mx-auto py-6">
            
            {/* Header intro card */}
            <div className="text-center py-10 px-6 rounded-3xl bg-linear-to-r from-emerald-800 to-emerald-950 text-white shadow-lg mb-10">
              <div className="inline-flex bg-emerald-600/40 border border-emerald-500/50 p-3 rounded-2xl mb-4 text-emerald-300">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
                Master Spreadsheets from Scratch
              </h1>
              <p className="text-emerald-200 mt-4 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
                Welcome to <strong className="font-semibold text-white">GridAcademy</strong>. Practice with real interactive spreadsheet cells, earn accomplishments, and use AI diagnostics to troubleshoot formulas in real-time.
              </p>
            </div>

            <StudyPathSelection
              currentPath={progress.selectedPath}
              onSelectPath={handleEnrollPath}
            />
          </div>
        ) : (
          <div>
            
            {/* Active Workspace View: LESSONS / PRACTICE */}
            {activeTab === "lessons" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* 1. Left Sidebar: Lesson curriculum Map */}
                <div id="lessons-sidebar" className="xl:col-span-3 space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-3xs">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Curriculum</span>
                        <h4 className="text-sm font-bold text-slate-800 tracking-tight capitalize">{progress.selectedPath} Path</h4>
                      </div>
                      <button
                        onClick={() => saveProgress({ ...progress, selectedPath: null })}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center shrink-0 cursor-pointer"
                      >
                        Change track
                      </button>
                    </div>

                    {/* Simple filter list matches current enroll path */}
                    <div className="mt-3 space-y-1.5">
                      {filteredLessons.map((l) => {
                        const isSelected = l.id === selectedLessonId;
                        const isCompleted = progress.completedLessons.includes(l.id);

                        return (
                          <button
                            key={l.id}
                            id={`lesson-selector-${l.id}`}
                            onClick={() => {
                              setSelectedLessonId(l.id);
                              setCurrentExerciseIndex(0);
                              setCurrentAdvice(null);
                            }}
                            className={`w-full text-left p-3 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                                : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span className="text-base shrink-0 select-none">
                                {isCompleted ? "🏆" : l.difficulty === "Advanced" ? "🎓" : "📒"}
                              </span>
                              <span className="truncate block font-sans">{l.title}</span>
                            </div>
                            {isCompleted && (
                              <CheckCircle className={`w-4 h-4 shrink-0 ${isSelected ? "text-white fill-emerald-700" : "text-emerald-600 fill-emerald-50"}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Level stats mini overlay */}
                  <div className="bg-linear-to-br from-slate-900 to-slate-950 rounded-xl p-4 text-white border border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">SCHOLAR ID CARD</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-emerald-500 font-mono font-bold text-sm flex items-center justify-center">
                        S{progress.level}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-slate-200">You (Academy Scholar)</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">Class Rank #{progress.level * 2}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold uppercase font-mono">Streak multiplier</span>
                      <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center">
                        <Zap className="w-3 h-3 mr-0.5 fill-orange-400" />
                        1.5X XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Center Column: Selected Lesson guidelines and Practice exercise */}
                <div id="lesson-workspace" className="xl:col-span-5 space-y-6">
                  
                  {/* Lesson detail card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <BookMarked className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-black text-slate-800 tracking-tight font-sans">
                          {activeLesson.title}
                        </h2>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded font-mono">
                        🕰️ Est. {activeLesson.estimatedTime}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs mt-4 leading-relaxed font-sans">
                      {activeLesson.description}
                    </p>

                    {/* Lesson interactive Diagnostic Quiz (optional) */}
                    {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase block mb-3 font-mono">
                          Conceptual Practice Quiz
                        </span>
                        
                        {activeLesson.quiz.map((q) => {
                          const showResult = showQuizResults[q.id];
                          const selectedIdx = quizAnswers[q.id];
                          const isCorrect = selectedIdx === q.correctAnswer;

                          return (
                            <div key={q.id} className="mb-4 last:mb-0">
                              <h4 className="text-xs font-bold text-slate-800 mb-2.5 leading-snug">{q.question}</h4>
                              <div className="space-y-1.5">
                                {q.options.map((option, oIdx) => (
                                  <button
                                    key={oIdx}
                                    onClick={() => !showResult && handleSelectQuizAnswer(q.id, oIdx)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                                      showResult
                                        ? oIdx === q.correctAnswer
                                          ? "bg-emerald-100 text-emerald-900 border-emerald-300 border font-medium"
                                          : selectedIdx === oIdx
                                            ? "bg-rose-100 text-rose-900 border-rose-300 border"
                                            : "bg-white text-slate-400 border border-slate-100"
                                        : selectedIdx === oIdx
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-500 border-2 font-medium"
                                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span>{option}</span>
                                    {showResult && oIdx === q.correctAnswer && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                                  </button>
                                ))}
                              </div>

                              {/* Quiz Action trigger */}
                              {!showResult && selectedIdx !== undefined && (
                                <button
                                  id={`submit-quiz-${q.id}`}
                                  onClick={() => handleSubmitQuiz(activeLesson.id, q.id, q.correctAnswer)}
                                  className="mt-3 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-4 py-1.5 rounded cursor-pointer transition-colors"
                                >
                                  Submit Quiz Answer (+50 XP)
                                </button>
                              )}

                              {/* Quiz explanation guide */}
                              {showResult && (
                                <div className={`mt-3 p-3 rounded-lg text-[11px] leading-relaxed border ${
                                  isCorrect 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                                    : "bg-amber-50 border-amber-200 text-amber-800"
                                }`}>
                                  <strong>{isCorrect ? "Correct! 🎉" : "Not quite."}</strong> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* High fidelity interactive spreadsheet challenge */}
                  <SpreadsheetSimulator
                    key={`${selectedLessonId}-${currentExerciseIndex}`} // Re-mount when selected lesson/index updates
                    exercise={activeExercise}
                    onSuccess={handleExerciseSuccess}
                    onFailure={handleExerciseFailure}
                    onAskAI={handleQueryAIAuditor}
                    aiIsLoading={isLoadingAdvice}
                  />

                </div>

                {/* 3. Right Column: Side-by-side AI Troubleshooting Coach Panel */}
                <div id="ai-auditor-panel" className="xl:col-span-4">
                  <FormulaTroubleshooter
                    currentAdvice={currentAdvice}
                    onClearAdvice={() => setCurrentAdvice(null)}
                    isLoadingAdvice={isLoadingAdvice}
                  />
                </div>

              </div>
            )}

            {/* View Tab 2: LEADERSBOARD */}
            {activeTab === "leaderboard" && (
              <div className="py-2">
                <div className="mb-6 bg-emerald-600 text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center sm:justify-start">
                      <Trophy className="w-6 h-6 mr-2 animate-bounce text-amber-300" />
                      Gamified Learning Arena
                    </h2>
                    <p className="text-emerald-100 text-xs sm:text-sm mt-1">Strengthen your streak multipliers, unlock all academy badges, and rise up levels!</p>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className="text-xs bg-emerald-700 font-mono border border-emerald-500/30 px-3 py-1.5 rounded-lg select-none">
                      Active: <strong>{progress.unlockedBadges.length} / {ACADEMY_BADGES.length} Badges</strong>
                    </span>
                  </div>
                </div>

                <Leaderboard
                  progress={progress}
                  badges={ACADEMY_BADGES}
                />
              </div>
            )}

            {/* View Tab 3: Tutor conversational coach */}
            {activeTab === "tutor" && (
              <div className="max-w-3xl mx-auto py-2">
                
                {/* Intro guide header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center">
                      <Sparkles className="w-5 h-5 mr-1.5 text-purple-600 animate-pulse" />
                      Meet Coach Gridy
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-lg">
                      Ask Gridy general spreadsheet concepts about pivot tables, formulas like VLOOKUP vs INDEX-MATCH, data sorting, keyboard shortcuts, or conditional formatting.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-purple-600 font-bold tracking-wider uppercase bg-purple-50 px-2.5 py-1 rounded border border-purple-100">
                    Gemini AI Powered
                  </span>
                </div>

                <FormulaTroubleshooter
                  currentAdvice={null}
                  onClearAdvice={() => {}}
                  isLoadingAdvice={false}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Celebrate level up modal */}
      {celebrateLevel !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in">
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-emerald-500 to-teal-500" />
            
            <span className="text-5xl block animate-bounce my-4">🎉</span>
            <span className="inline-block bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded">
              Level Up Accomplished!
            </span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2.5">
              Level {celebrateLevel} Scholar Unlocked
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Splendid progress! You've ascended status to Level {celebrateLevel}. Keep solving simulator assignments to stack more XP and dominate standings!
            </p>

            <button
              onClick={() => setCelebrateLevel(null)}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Continue Learning Adventure
            </button>
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400 select-none">
        <p>© 2026 GridAcademy Excel Learning Platform. Made easily with Gemini 3.5 Flash.</p>
      </footer>

    </div>
  );
}
