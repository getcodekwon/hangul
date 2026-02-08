import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VOWELS, CONSONANTS } from '../data/vowels';

export function SelectionScreen() {
    const navigate = useNavigate();
    const { mode } = useParams(); // 'vowel' or 'consonant'

    // Determine data source based on mode
    const isVowelMode = mode === 'vowel';
    const isTracingMode = mode === 'tracing';

    // For tracing, we currently use Consonants (could expand to vowels later)
    const items = isVowelMode ? VOWELS : CONSONANTS.map(c => ({ char: c, label: c, color: '#FFD700' }));

    // Colors for consonants (optional: cycling colors)
    const getConsonantColor = (index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'];
        return colors[index % colors.length];
    };

    const handleItemClick = (item) => {
        if (isTracingMode) {
            navigate(`/tracing/${item.char}`);
        } else {
            navigate(`/game/${mode}/${item.char}`);
        }
    };

    return (
        <div style={styles.container}>
            {/* Game Select Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/mode-select')}
                style={styles.navButton}
            >
                게임 선택
            </motion.button>

            <h1 style={styles.title}>
                {isTracingMode ? '어떤 글씨를 써볼까요?' :
                    isVowelMode ? '어떤 모음을 배워볼까요?' : '어떤 자음을 배워볼까요?'}
            </h1>

            <div style={styles.grid}>
                {items.map((item, index) => (
                    <motion.button
                        key={item.char}
                        style={{
                            ...styles.card,
                            backgroundColor: isVowelMode ? item.color : getConsonantColor(index),
                            width: isVowelMode ? '150px' : '100px', // Smaller cards for consonants
                            height: isVowelMode ? '200px' : '130px',
                        }}
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleItemClick(item)}
                    >
                        <div style={{ ...styles.char, fontSize: isVowelMode ? '5rem' : '3.5rem' }}>{item.char}</div>
                        {isVowelMode && <div style={styles.label}>{item.label}</div>}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        fontFamily: '"Jua", sans-serif',
        position: 'relative',
        padding: '2rem', // Add padding for scrolling if needed
    },
    navButton: {
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        padding: '0.8rem 1.5rem',
        fontSize: '1.5rem',
        borderRadius: '20px',
        border: '3px solid #ccc',
        backgroundColor: '#f0f0f0',
        color: '#555',
        fontFamily: '"Jua", sans-serif',
        cursor: 'pointer',
    },
    title: {
        fontSize: '3rem',
        color: '#333',
        marginBottom: '3rem',
        marginTop: '4rem', // Space for nav button
    },
    grid: {
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '1000px', // Limit width for better grid on large screens
    },
    card: {
        borderRadius: '20px',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        color: 'white',
    },
    char: {
        marginBottom: '0.5rem',
    },
    label: {
        fontSize: '2rem',
        opacity: 0.9,
    }
};
