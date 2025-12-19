import React from 'react';

interface PixelCardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    dark?: boolean;
}

const PixelCard: React.FC<PixelCardProps> = ({ children, title, className = '', dark = true }) => {
    return (
        <div className={`nes-container with-title is-centered ${dark ? 'is-dark' : ''} ${className}`}>
            {title && <p className="title">{title}</p>}
            {children}
        </div>
    );
};

export default PixelCard;
