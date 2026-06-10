import React from "react";
import { Trophy, Medal, Flame, Award, Shield, CheckCircle, Lock, Users, Sparkles } from "lucide-react";
import { UserProgress, Badge, LeaderboardEntry } from "../types";

interface LeaderboardProps {
  progress: UserProgress;
  badges: Badge[];
}

export default function Leaderboard({ progress, badges }: LeaderboardProps) {
  // Generate leaderboard listing with user spliced dynamically
  const baseLeaderboard: Omit<LeaderboardEntry, "isCurrentUser" | "rank">[] = [
    { name: "SheetGrandmaster_88", xp: 3200, avatarColor: "bg-amber-100 text-amber-800 border-amber-300", streak: 21 },
    { name: "GridSlayer_🔥", xp: 2450, avatarColor: "bg-red-100 text-red-800 border-red-300", streak: 12 },
    { name: "DataSorcerer", xp: 1800, avatarColor: "bg-indigo-100 text-indigo-800 border-indigo-300", streak: 9 },
    { name: "PivotQueen_9", xp: 1200, avatarColor: "bg-purple-100 text-purple-800 border-purple-300", streak: 7 },
    { name: "LookupLover", xp: 550, avatarColor: "bg-blue-100 text-blue-800 border-blue-300", streak: 4 },
    { name: "ExcelNovice", xp: 120, avatarColor: "bg-slate-100 text-slate-800 border-slate-300", streak: 1 }
  ];

  // Splice current user into the ranking pool and sort
  const userEntry: Omit<LeaderboardEntry, "isCurrentUser" | "rank"> = {
    name: "You (Scholar)",
    xp: progress.xp,
    avatarColor: "bg-emerald-600 text-white border-emerald-700",
    streak: progress.streak
  };

  const sortedLeaderboard: LeaderboardEntry[] = [...baseLeaderboard, userEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.name.startsWith("You")
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Leaderboard Column */}
      <div id="leaderboard-panel" className="lg:col-span-2 bg-white brutal-border-thick shadow-brutal-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b-2 border-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="bg-amber-400 p-2.5 border-2 border-slate-900 rotate-[-2deg] text-slate-950">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Global Learning Standings</h3>
              <p className="text-xs text-slate-500 font-medium">Live comparison with master spreadsheet scholars</p>
            </div>
          </div>
          <div className="flex items-center bg-slate-900 text-white px-3 py-1.5 border-2 border-slate-900 text-[10px] font-black uppercase tracking-wider font-mono">
            <Users className="w-3.5 h-3.5 mr-1" />
            <span>{sortedLeaderboard.length} Scholars Active</span>
          </div>
        </div>

        {/* Players List Grid */}
        <div className="space-y-3">
          {sortedLeaderboard.map((player) => (
            <div
              key={player.name}
              className={`flex items-center justify-between p-3.5 brutal-border transition-all ${
                player.isCurrentUser
                  ? "bg-emerald-50 shadow-brutal ring-2 ring-emerald-500"
                  : "bg-white shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5"
              }`}
            >
              <div className="flex items-center space-x-4">
                
                {/* Placement Rank indicator */}
                <div className="w-7 text-center">
                  {player.rank === 1 ? (
                    <Trophy className="w-6 h-6 text-amber-500 mx-auto fill-amber-50" />
                  ) : player.rank === 2 ? (
                    <Medal className="w-6 h-6 text-slate-400 mx-auto fill-slate-50" />
                  ) : player.rank === 3 ? (
                    <Medal className="w-6 h-6 text-amber-700 mx-auto fill-orange-50" />
                  ) : (
                    <span className="font-mono text-sm font-black text-slate-950">#{player.rank}</span>
                  )}
                </div>

                {/* Avatar Icon */}
                <div className={`w-9 h-9 rounded-full ${player.avatarColor} border-2 border-slate-950 font-mono font-black text-xs flex items-center justify-center select-none`}>
                  {player.name.substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <span className={`text-sm block uppercase tracking-tight ${player.isCurrentUser ? "font-black text-emerald-950" : "font-black text-slate-900"}`}>
                    {player.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider mt-0.5">
                    Grid Scholar Level {Math.floor(player.xp / 300) + 1}
                  </span>
                </div>
              </div>

              {/* Stats: XP & Streak */}
              <div className="flex items-center space-x-6">
                
                {/* Fire streak */}
                <div className="flex items-center text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2.5 py-1 brutal-border shadow-brutal-sm">
                  <Flame className="w-3.5 h-3.5 mr-1 text-orange-500 fill-orange-500" />
                  <span>{player.streak}d</span>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-base font-black font-mono text-slate-900">{player.xp}</span>
                  <span className="text-[9px] text-slate-400 block font-black uppercase tracking-widest font-mono leading-none">XP</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Drawer Column */}
      <div id="badges-panel" className="bg-white brutal-border-thick shadow-brutal-lg p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-6 pb-4 border-b-2 border-slate-900">
            <div className="bg-emerald-500 border-2 border-slate-900 text-white p-2.5 rotate-[3deg] shadow-brutal-sm">
              <Award className="w-5 h-5 hover:scale-115 transition-transform" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tighter">Academy Badges</h3>
              <p className="text-xs text-slate-500 font-medium">Unlocked milestones</p>
            </div>
          </div>

          {/* Badges List */}
          <div className="grid grid-cols-1 gap-3">
            {badges.map((badge) => {
              const isUnlocked = progress.unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`flex items-center space-x-3.5 p-3 brutal-border transition-colors ${
                    isUnlocked 
                      ? "bg-slate-50/50 shadow-brutal-sm" 
                      : "bg-slate-50/20 opacity-50"
                  }`}
                >
                  <div className={`p-2.5 border-2 border-slate-900 ${
                    isUnlocked 
                      ? badge.colorClass + " text-white" 
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    {isUnlocked ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-tight ${isUnlocked ? "text-slate-950" : "text-slate-400"}`}>
                        {badge.title}
                      </span>
                      {isUnlocked && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{badge.description}</p>
                    {isUnlocked && badge.unlockedAt && (
                      <span className="text-[9px] font-mono font-medium text-slate-400 block mt-1">Unlocked {badge.unlockedAt}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation Card */}
        <div className="bg-white border-2 border-slate-900 shadow-brutal-sm p-4 mt-6 text-center">
          <span className="text-xs text-slate-950 font-black uppercase tracking-tight flex items-center justify-center">
            <Shield className="w-4 h-4 mr-1.5 text-emerald-600 animate-bounce" />
            Academy Hall of Fame
          </span>
          <p className="text-[10px] text-slate-500 mt-1 font-medium">
            Complete high level IF and VLOOKUP exercises to capture elite statuses!
          </p>
        </div>
      </div>

    </div>
  );
}
