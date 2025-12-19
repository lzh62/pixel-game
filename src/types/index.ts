export interface Question {
    id: string | number;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    answer?: string; // Only present if doing client-side validation, but user wants server-side mostly.
}

export interface User {
    id: string;
}

export interface GameResult {
    score: number;
    passed: boolean;
    totalQuestions: number;
}

export interface GameState {
    questions: Question[];
    currentQuestionIndex: number;
    answers: { id: string | number; answer: string }[];
    loading: boolean;
    completed: boolean;
    score: number | null;
}
