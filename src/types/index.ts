export interface TestResult {
  score: number;
  total: number;
  correct: number;
}

export interface TestHistoryItem {
  id: number;
  topic: string;
  score: number;
  date: string;
}

export interface User {
  id: string; // Changed to string to match other files
  username: string;
  email: string;
  role?: string; // Added role property
  settings: {
    darkMode: boolean;
    testTimer: number | null;
  };
}