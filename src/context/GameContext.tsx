import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { GameResult } from '../types';

interface GameContextType {
    userId: string;
    setUserId: (id: string) => void;
    gameResult: GameResult | null;
    setGameResult: (result: GameResult | null) => void;
    resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string>('');
    const [gameResult, setGameResult] = useState<GameResult | null>(null);

    const resetGame = () => {
        // Keep userId? Probably yes.
        setGameResult(null);
    };

    return (
        <GameContext.Provider value={{ userId, setUserId, gameResult, setGameResult, resetGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
