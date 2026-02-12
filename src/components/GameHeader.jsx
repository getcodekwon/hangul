import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function GameHeader({ children }) {
    const navigate = useNavigate();

    return (
        <div style={styles.navContainer}>
            {children}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/mode-select')}
                style={styles.navButton}
            >
                게임 선택
            </motion.button>
        </div>
    );
}

const styles = {
    navContainer: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        gap: '1rem',
        zIndex: 100,
    },
    navButton: {
        padding: '0.8rem 1.2rem',
        fontSize: '1.2rem',
        borderRadius: '15px',
        border: '3px solid #ccc',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#555',
        fontFamily: '"Jua", sans-serif',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
};
