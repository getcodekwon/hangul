import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function GameModeSelection() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            {/* Exit Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/')}
                style={styles.exitButton}
            >
                종료
            </motion.button>

            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={styles.title}
            >
                어떤 게임을 할까요
            </motion.h1>

            <div style={styles.menuContainer}>
                {/* 1. Basic Vowel Game */}
                <MenuButton
                    color="#FF6B6B" // Red/Pink
                    label="기본 모음 게임"
                    onClick={() => navigate('/select/vowel')}
                    delay={0.1}
                />

                {/* 2. Basic Consonant Game */}
                <MenuButton
                    color="#4ECDC4" // Teal
                    label="기본 자음 게임"
                    onClick={() => navigate('/select/consonant')}
                    delay={0.2}
                />

                {/* 3. Writing Game (Placeholder) */}
                <MenuButton
                    color="#FFD93D" // Yellow
                    label="글씨 따라쓰기 게임"
                    onClick={() => navigate('/select/tracing')}
                    delay={0.3}
                />

                {/* 4. Word Train Game */}
                <MenuButton
                    color="#A8D5BA" // Green (Pastel)
                    label="칙칙폭폭 낱말 기차"
                    onClick={() => navigate('/game/train/0')}
                    delay={0.4}
                />

                {/* 5. Initial Sound Quiz */}
                <MenuButton
                    color="#B39DDB" // Purple (Pastel)
                    label="초성 퀴즈"
                    onClick={() => navigate('/game/quiz/0')}
                    delay={0.5}
                />
            </div>
        </div>
    );
}

function MenuButton({ color, label, onClick, delay }) {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay, type: 'spring' }}
            style={{ ...styles.button, backgroundColor: color, boxShadow: `0 8px 0 ${shadeColor(color, -20)}` }}
            onClick={onClick}
        >
            {label}
        </motion.button>
    );
}

// Helper to darken color for 3D effect shadow
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    let RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    let GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    let BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#fff',
        fontFamily: '"Jua", sans-serif',
        position: 'relative', // Added for absolute positioning of exit button
    },
    exitButton: {
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
        fontSize: '3.5rem',
        color: '#555',
        marginBottom: '3rem',
    },
    menuContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        width: '90%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
    },
    button: {
        width: '100%',
        aspectRatio: '1', // Make buttons square
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        fontSize: '1.8rem',
        borderRadius: '30px',
        border: 'none',
        color: 'white',
        fontFamily: '"Jua", sans-serif',
        cursor: 'pointer',
        textAlign: 'center',
        wordBreak: 'keep-all', // Prevent awkward word breaks
        lineHeight: '1.3',
    }
};
