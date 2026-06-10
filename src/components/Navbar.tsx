import React from "react";
import { Award, Trophy, Zap, Compass, RefreshCw } from "lucide-react";
import { UserProgress } from "../types";

interface NavbarProps {
  progress: UserProgress;
  onResetProgress: () => void;
  onNavigate: (tab: "lessons" | "leaderboard" | "challenges" | "tutor") => void;
  activeTab: string;
}

export default function Navbar({ progress, onResetProgress, onNavigate, activeTab }: NavbarProps) {
  const percentToNextLevel = Math.min(100, Math.floor((progress.xp / progress.xpToNextLevel) * 100));

  return (
    <header id="navbar-container" className="bg-white border-b-4 border-slate-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo with Bold Rotate theme */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("lessons")}>
            <div className="bg-emerald-500 text-white p-2.5 brutal-border rotate-[-3deg] shadow-brutal-sm flex items-center justify-center">
              <span className="font-mono font-black text-xl leading-none italic select-none">XL</span>
            </div>
            <div>
              <span className="font-sans font-black text-2xl text-slate-900 tracking-tighter uppercase block leading-none">GridAcademy</span>
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-black leading-none mt-1 block">Mastery simulation</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-2">
            <button
              id="nav-lessons-tab"
              onClick={() => onNavigate("lessons")}
              className={`px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-tight flex items-center space-x-2 border-2 ${
                activeTab === "lessons" 
                  ? "bg-emerald-50 text-slate-900 border-slate-900 shadow-brutal-sm" 
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Study Path</span>
            </button>
            <button
              id="nav-leaderboard-tab"
              onClick={() => onNavigate("leaderboard")}
              className={`px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-tight flex items-center space-x-2 border-2 ${
                activeTab === "leaderboard" 
                  ? "bg-indigo-50 text-indigo-950 border-slate-900 shadow-brutal-sm" 
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
            <button
              id="nav-tutor-tab"
              onClick={() => onNavigate("tutor")}
              className={`px-4 py-2 rounded-xl transition-all text-xs font-black uppercase tracking-tight flex items-center space-x-2 border-2 ${
                activeTab === "tutor" 
                  ? "bg-purple-50 text-purple-950 border-slate-900 shadow-brutal-sm" 
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Coach Gridy AI</span>
            </button>
          </nav>

          {/* Gamification Stats */}
          <div className="flex items-center space-x-4">
            
            {/* Streak Tracker styled corresponding to Design HTML */}
            <div className="flex flex-col items-end leading-none">
              <span className="text-[9px] uppercase font-black text-slate-400">Current Streak</span>
              <span className="text-base sm:text-lg font-black italic text-orange-500 tracking-tighter uppercase">
                {progress.streak} DAYS
              </span>
            </div>

            {/* Level & XP progression indicator */}
            <div className="hidden lg:flex flex-col text-right leading-none justify-center">
              <span className="text-[10px] uppercase font-black text-slate-400">Rank Level</span>
              <span className="text-xs font-black text-slate-800 uppercase mt-0.5">S{progress.level} Scholar</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-[9px] font-mono text-slate-400 font-bold">{progress.xp}/{progress.xpToNextLevel} XP</span>
                <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-300">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentToNextLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Path Badge indicator */}
            {progress.selectedPath && (
              <div className="hidden sm:flex items-center bg-white brutal-border px-2.5 py-1 text-[10px] font-black uppercase tracking-tight shadow-brutal-sm">
                <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>{progress.selectedPath}</span>
              </div>
            )}

            {/* Reset Button */}
            <button 
              id="reset-progress-btn"
              onClick={onResetProgress}
              title="Reset All Progress"
              className="p-2 border-2 border-slate-900 hover:bg-rose-50 hover:text-rose-600 transition-colors text-slate-500 bg-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
