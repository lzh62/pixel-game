import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import PixelCard from '../components/PixelCard';

const Result: React.FC = () => {
    const { gameResult, userId, resetGame } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (!gameResult || !userId) {
            navigate('/');
        }
    }, [gameResult, userId, navigate]);

    if (!gameResult) return null;

    const { score, passed, totalQuestions } = gameResult;

    const handleHome = () => {
        resetGame();
        navigate('/');
    };

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {passed ? (
                    <>
                        <i className="nes-icon trophy is-large"></i>
                        <h1 style={{ color: '#92cc41', marginTop: '1rem' }}>任务完成！</h1>
                    </>
                ) : (
                    <>
                        <i className="nes-icon close is-large"></i>
                        <h1 style={{ color: '#e76e55', marginTop: '1rem' }}>游戏结束</h1>
                    </>
                )}
            </div>

            <PixelCard title="结果">
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                    <p>玩家: <span className="nes-text is-primary">{userId}</span></p>
                    <p>得分: <span className={`nes-text ${passed ? 'is-success' : 'is-error'}`}>
                        {score} / {totalQuestions * 10 /* assuming 10 pts per q, or display raw count */}
                    </span> (答对: {score})</p>

                    <p style={{ marginTop: '1rem' }}>
                        {passed
                            ? "你成功保卫了像素世界！"
                            : "别放弃！再试一次，拯救世界！"}
                    </p>
                </div>

                <button className="nes-btn is-primary" style={{ width: '100%' }} onClick={handleHome}>
                    返回标题
                </button>
            </PixelCard>
        </motion.div>
    );
};

export default Result;
