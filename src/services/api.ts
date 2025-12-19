import axios from 'axios';
import type { Question, GameResult } from '../types';

const API_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || '';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock Data
// Mock Data
const MOCK_QUESTIONS: Question[] = [
    {
        id: 1,
        question: "1 + 1 等于多少？",
        options: { A: "1", B: "2", C: "3", D: "4" }
    },
    {
        id: 2,
        question: "像素风最早流行因为？",
        options: { A: "看起来很酷", B: "硬件限制", C: "设计师懒", D: "更加清晰" }
    },
    {
        id: 3,
        question: "超级马里奥是？",
        options: { A: "水管工", B: "木匠", C: "骑士", D: "反派" }
    },
    {
        id: 4,
        question: "React 是谁开发的？",
        options: { A: "Google", B: "Amazon", C: "Cbook", D: "Meta (Facebook)" }
    },
    {
        id: 5,
        question: "哪种颜色不是RGB？",
        options: { A: "红", B: "黄", C: "绿", D: "蓝" }
    },
    {
        id: 6,
        question: "HTML 代表什么？",
        options: { A: "HyperText", B: "HighTech", C: "HomeTool", D: "HardText" }
    },
    {
        id: 7,
        question: "JS 中的 'const' 意味着？",
        options: { A: "常量", B: "变量", C: "函数", D: "类" }
    },
    {
        id: 8,
        question: "互联网的基础协议是？",
        options: { A: "FTP", B: "HTTP", C: "SMTP", D: "POP3" }
    },
    {
        id: 9,
        question: "最大的行星是？",
        options: { A: "地球", B: "火星", C: "木星", D: "金星" }
    },
    {
        id: 10,
        question: "像素的基本单位是？",
        options: { A: "比特", B: "字节", C: "点", D: "格" }
    }
];

export const fetchQuestions = async (count: number): Promise<Question[]> => {
    if (USE_MOCK || !API_URL) {
        console.warn('Using Mock Data for Questions');
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_QUESTIONS.slice(0, count));
            }, 1000);
        });
    }

    try {
        // GAS usually requires no-cors for simple fetches dependent on setup, 
        // but we need the data, so we need simple GET.
        // However, GAS `doGet` outputting JSON is standard.
        // Sometimes we need `redirect: 'follow'`.
        const response = await axios.get(API_URL, {
            params: {
                action: 'getQuestions',
                count
            }
        });

        if (response.data && response.data.status === 'success') {
            return response.data.data;
        }
        throw new Error('Failed to fetch questions');
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock if API fails?
        // return MOCK_QUESTIONS.slice(0, count);
        throw error;
    }
};

export const submitScore = async (id: string, answers: { id: string | number; answer: string }[], threshold: number): Promise<GameResult> => {
    if (USE_MOCK || !API_URL) {
        console.warn('Using Mock Data for Submit');
        return new Promise(resolve => {
            setTimeout(() => {
                // Mock grading: all 'A' are correct
                let score = 0;
                answers.forEach(() => {
                    // Randomly assign correctness for mock
                    if (Math.random() > 0.5) score++;
                });
                resolve({
                    score,
                    passed: score >= threshold,
                    totalQuestions: answers.length
                });
            }, 1500);
        });
    }

    // Use axios.post. For GAS, often we need to use 'no-cors' mode with fetch if we don't need response, 
    // but we DO need response. 
    // Native axios post might trigger CORS preflight which GAS doesn't support well intentionally.
    // Standard workaround: Use `Content-Type: text/plain;charset=utf-8` to avoid preflight options -> `navigator.sendBeacon` or hidden form?
    // Actually, axios `post` with `application/json` triggers preflight.
    // GAS `doPost` can accept text plain.

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                id,
                answers,
                threshold,
                // action: 'submitScore' // if passing in body
            }),
            // Don't set Content-Type to application/json to avoid preflight if possible, 
            // OR GAS must handle OPTIONS.
            // My GAS script handled `Access-Control-Allow-Origin: *`, but `doGet`/`doPost` doesn't automatically handle OPTIONS in GAS unless we write it.
            // Easiest "Safe" way for GAS POST is often sending as text/plain.
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            }
        });

        const data = await response.json();
        if (data.status === 'success') {
            return data.data;
        }
        throw new Error(data.message || 'Submission failed');

    } catch (error) {
        console.error('Submit Error:', error);
        throw error;
    }
};

export const getCharacterImage = (seed: string) => {
    return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;
};
