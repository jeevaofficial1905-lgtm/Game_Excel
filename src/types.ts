export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  title: string;
  instruction: string;
  hint: string;
  targetCell: string;
  initialGrid: Record<string, string>; // e.g., { "A1": "15", "A2": "25", "A3": "" }
  correctFormulaPattern: string; // RegExp pattern or substring to verify formula design
  correctFormulaDesc: string; // What we display, e.g. "=SUM(A1:A2)"
  expectedValue: string; // The text or numerical answer we expect when evaluated
  successMessage?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of option
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  estimatedTime: string;
  quiz?: QuizQuestion[];
  exercises: Exercise[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatarColor: string;
  streak: number;
  isCurrentUser?: boolean;
}

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  selectedPath: Difficulty | null;
  unlockedBadges: string[];
  completedLessons: string[];
  completedExercises: Record<string, boolean>; // map of exerciseId -> completed
  exerciseAttempts: Record<string, number>; // exerciseId -> number of attempts
}
