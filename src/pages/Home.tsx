import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import PixelCard from '../components/PixelCard';

const Home: React.FC = () => {
    const [inputName, setInputName] = useState('');
    const [error, setError] = useState('');
    const { setUserId } = useGame();
    const navigate = useNavigate();

    const handleStart = () => {
        if (!inputName.trim()) {
            setError('请输入您的ID');
            return;
        }
        setUserId(inputName.trim());
        navigate('/game');
    };

    return (
        <motion.div
            className="container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <i className="nes-icon trophy is-large"></i>
                <h1 style={{ marginTop: '1rem', color: '#f7d51d' }}>像素大冒险</h1>
                <p>挑战8位世界</p>
            </div>

            <PixelCard title="玩家登录">
                <div className="nes-field" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                    <label htmlFor="name_field">输入您的ID</label>
                    <input
                        type="text"
                        id="name_field"
                        className={`nes-input ${error ? 'is-error' : ''}`}
                        value={inputName}
                        onChange={(e) => {
                            setInputName(e.target.value);
                            setError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                        placeholder="英雄ID..."
                    />
                    {error && <span className="nes-text is-error">{error}</span>}
                </div>

                <button
                    type="button"
                    className="nes-btn is-primary"
                    onClick={handleStart}
                    style={{ width: '100%' }}
                >
                    开始游戏
                </button>
            </PixelCard>

            <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.7, fontSize: '0.8rem' }}>
                <p>使用键盘或鼠标进行游戏</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <i className="nes-ash"></i>
                    <i className="nes-pokeball"></i>
                    <i className="nes-bulbasaur"></i>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
