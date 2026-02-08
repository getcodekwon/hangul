import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dogGroup from '../assets/dog_group.png';

export function IntroScreen() {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // 15 seconds loading time = 15000ms
        const duration = 15000;
        const intervalTime = 100;
        const steps = duration / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => navigate('/mode-select'), 500); // Redirect to Game Mode Select
                    return 100;
                }
                return prev + increment;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div style={styles.container}>
            {/* Running Dogs Animation */}
            <div style={styles.animationContainer}>
                <motion.img
                    src={chaseImage}
                    alt="Chase Running"
                    style={{ width: '100px', height: '100px', position: 'absolute', top: 0 }}
                    animate={{ x: [-150, 150], y: [0, -20, 0] }} // Run left-right and bounce
                    transition={{
                        x: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "linear" },
                        y: { duration: 0.3, repeat: Infinity, repeatType: "mirror", ease: "easeOut" }
                    }}
                />
                <motion.img
                    src={skyeImage}
                    alt="Skye Running"
                    style={{ width: '100px', height: '100px', position: 'absolute', top: 0 }}
                    animate={{ x: [150, -150], y: [0, -20, 0] }} // Run right-left and bounce
                    transition={{
                        x: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "linear" },
                        y: { duration: 0.3, repeat: Infinity, repeatType: "mirror", ease: "easeOut", delay: 0.1 }
                    }}
                />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                style={styles.title}
            >
                한글 친구들을 만나러 가는 중...
            </motion.div>

            <div style={styles.progressBarContainer}>
                <motion.div
                    style={{ ...styles.progressBar, width: `${progress}%` }}
                />
            </div>
            <div style={styles.percentage}>{Math.round(progress)}%</div>
        </div>
    );
}

import chaseImage from '../assets/dogs/chase_style.png';
import skyeImage from '../assets/dogs/skye_style.png';

export function LandingScreen() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.heroRow}>
                {/* Chase Style Dog (Left) */}
                <motion.img
                    src={chaseImage}
                    alt="Police Puppy"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    style={styles.sideCharacter}
                />

                {/* Title (Center) */}
                <motion.h1
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    style={styles.gameTitle}
                >
                    한글 게임
                </motion.h1>

                {/* Skye Style Dog (Right) */}
                <motion.img
                    src={skyeImage}
                    alt="Aviator Puppy"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    style={styles.sideCharacter}
                />
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/intro')} // Go to Loading Screen first
                style={styles.startButton}
            >
                게임 시작
            </motion.button>
        </div>
    );
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
        overflow: 'hidden',
    },
    // ... (Keep IntroScreen styles if needed, or re-declare)
    animationContainer: {
        position: 'relative',
        width: '400px',
        height: '150px',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '3rem',
        color: '#333',
        marginBottom: '2rem',
    },
    progressBarContainer: {
        width: '60%',
        height: '20px',
        backgroundColor: '#eee',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4ECDC4',
        borderRadius: '10px',
    },
    percentage: {
        marginTop: '1rem',
        fontSize: '1.5rem',
        color: '#888',
    },

    // Landing Page Styles
    heroRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '3rem',
        width: '100%',
    },
    gameTitle: {
        fontSize: '5rem',
        color: '#FF6B6B',
        textShadow: '4px 4px 0 #ffe66d',
        margin: 0, // Reset margin since it's in a flex row
        lineHeight: 1.2,
    },
    sideCharacter: {
        width: '250px', // Adjusted size
        maxWidth: '25vw',
        objectFit: 'contain',
    },
    startButton: {
        fontSize: '2.5rem',
        padding: '0.8rem 2.5rem',
        borderRadius: '50px',
        border: 'none',
        backgroundColor: '#FF6B6B',
        color: 'white',
        fontFamily: '"Jua", sans-serif',
        cursor: 'pointer',
        boxShadow: '0 8px 0 #D94444',
    }
};
