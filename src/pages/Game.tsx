import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { fetchQuestions, submitScore, getCharacterImage } from '../services/api';
import type { Question } from '../types';
import PixelCard from '../components/PixelCard';
import { motion, AnimatePresence } from 'framer-motion';

const Game: React.FC = () => {
    const { userId, setGameResult } = useGame();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ id: string | number; answer: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Config
    const QUESTION_COUNT = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5');
    const PASS_THRESHOLD = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3');

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchQuestions(QUESTION_COUNT);
                setQuestions(data);
            } catch (err) {
                setError('召唤怪物（问题）失败，请刷新重试。');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [userId, navigate, QUESTION_COUNT]);

    const handleAnswer = async (option: string) => {
        const currentQ = questions[currentIndex];
        const newAnswers = [...answers, { id: currentQ.id, answer: option }];
        setAnswers(newAnswers);

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finish
            await finishGame(newAnswers);
        }
    };

    const finishGame = async (finalAnswers: { id: string | number; answer: string }[]) => {
        setSubmitting(true);
        try {
            const result = await submitScore(userId, finalAnswers, PASS_THRESHOLD);
            setGameResult(result);
            navigate('/result');
        } catch (err) {
            setError('记录胜利失败，请重试。');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                <p>加载世界中...</p>
                <progress className="nes-progress is-pattern" value={0} max={100}></progress>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <PixelCard title="错误" className="is-error">
                    <p>{error}</p>
                    <button className="nes-btn" onClick={() => window.location.reload()}>重新加载</button>
                </PixelCard>
            </div>
        );
    }

    if (questions.length === 0) return null;

    const currentQ = questions[currentIndex];
    // Calculate Progress
    const progress = ((currentIndex) / questions.length) * 100;

    return (
        <div className="container" style={{ justifyContent: 'flex-start', paddingTop: '2rem' }}>

            {/* HUD */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label>生命值 (进度)</label>
                    <progress className="nes-progress is-success" value={progress} max={100}></progress>
                </div>
                <div className="nes-badge">
                    <span className="is-dark">关卡 {currentIndex + 1}</span>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%' }}
                >
                    {/* Boss Area */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', height: '150px' }}>
                        <img
                            src={getCharacterImage(String(currentQ.id))}
                            alt="Boss"
                            style={{ height: '100%', imageRendering: 'pixelated' }}
                        />
                    </div>

                    {/* Question */}
                    <PixelCard title={`挑战中`} className="with-title">
                        <p style={{ marginBottom: '2rem', minHeight: '3rem' }}>{currentQ.question}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {Object.entries(currentQ.options).map(([key, val]) => (
                                <button
                                    key={key}
                                    className="nes-btn"
                                    onClick={() => !submitting && handleAnswer(key)}
                                    disabled={submitting}
                                >
                                    {key}. {val}
                                </button>
                            ))}
                        </div>
                    </PixelCard>

                </motion.div>
            </AnimatePresence>

            {submitting && (
                <div style={{ position: 'fixed', bottom: '2rem', left: 0, right: 0, textAlign: 'center' }}>
                    <span className="nes-text is-primary" style={{ backgroundColor: '#000', padding: '0.5rem' }}>
                        正在保存进度...
                    </span>
                </div>
            )}
        </div>
    );
};

export default Game;
