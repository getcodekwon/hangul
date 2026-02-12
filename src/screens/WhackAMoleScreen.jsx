import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../components/GameHeader';
import confetti from 'canvas-confetti';
import { WORDS } from '../data/wordData';

// Helper to shuffle array
const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

export function WhackAMoleScreen() {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [moles, setMoles] = useState(Array(9).fill({ active: false, content: '', isTarget: false }));
    const [targetData, setTargetData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Game loop refs
    const timerRef = useRef(null);
    const moleTimerRef = useRef(null);
    const isPlayingRef = useRef(false);
    const targetDataRef = useRef(null);

    useEffect(() => {
        startGame();
        return () => stopGame();
    }, []);

    const startGame = () => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        setScore(0);
        setTimeLeft(30);

        // Pick new target
        const newTarget = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetData(newTarget);
        targetDataRef.current = newTarget;

        // Start Timer
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Start Mole Loop
        moleLoop();
    };

    const stopGame = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        clearInterval(timerRef.current);
        clearTimeout(moleTimerRef.current);
        setMoles(Array(9).fill({ active: false, content: '', isTarget: false }));
    };

    const moleLoop = () => {
        if (!isPlayingRef.current) return;

        // Random delay between pops
        const delay = Math.random() * 1000 + 500; // 0.5s - 1.5s

        moleTimerRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
                popUpMole();
                moleLoop();
            }
        }, delay);
    };

    const popUpMole = () => {
        const currentTarget = targetDataRef.current;
        if (!currentTarget) return;

        setMoles(prev => {
            const newMoles = [...prev];
            // Find inactive holes
            const inactiveIndices = newMoles.map((m, i) => !m.active ? i : -1).filter(i => i !== -1);

            if (inactiveIndices.length === 0) return prev;

            // Pick random hole
            const randomIndex = inactiveIndices[Math.floor(Math.random() * inactiveIndices.length)];

            // Determine content (Target or Distractor)
            // 40% chance of target, 60% chance of distractor
            const isTarget = Math.random() < 0.4;
            let content = '';

            if (isTarget) {
                content = currentTarget.word;
            } else {
                // Pick random distractor from WORDS
                const distractor = WORDS[Math.floor(Math.random() * WORDS.length)];
                content = distractor.word;
                // Avoid accidental match
                if (content === currentTarget.word) {
                    content = WORDS[(WORDS.indexOf(distractor) + 1) % WORDS.length].word;
                }
            }

            newMoles[randomIndex] = { active: true, content, isTarget };

            // Hide mole after active time
            setTimeout(() => {
                setMoles(current => {
                    if (!isPlayingRef.current) return current; // Don't update if game stopped
                    const updated = [...current];
                    if (updated[randomIndex]) {
                        updated[randomIndex] = { ...updated[randomIndex], active: false };
                    }
                    return updated;
                });
            }, Math.random() * 1000 + 800); // Active for 0.8s - 1.8s

            return newMoles;
        });
    };

    const handleMoleClick = (index) => {
        const mole = moles[index];
        if (!mole.active) return;

        if (mole.isTarget) {
            // Hit!
            setScore(prev => prev + 10);
            confetti({
                particleCount: 30,
                spread: 30,
                origin: { x: getMoleX(index), y: getMoleY(index) }
            });
            // Hide mole immediately
            setMoles(prev => {
                const newMoles = [...prev];
                newMoles[index] = { ...newMoles[index], active: false };
                return newMoles;
            });
        } else {
            // Miss!
            setScore(prev => Math.max(0, prev - 5));
        }
    };

    // Approximate mole position for confetti (normalized 0-1)
    const getMoleX = (i) => ((i % 3) + 0.5) / 3;
    const getMoleY = (i) => (Math.floor(i / 3) + 0.5) / 3 + 0.2; // Offset for header

    return (
        <div style={styles.container}>
            {/* Header */}
            <GameHeader />
            <div style={styles.header}>
                <div style={styles.infoBox}>
                    <span style={styles.label}>점수</span>
                    <span style={styles.value}>{score}</span>
                </div>

                {/* Target Display */}
                <div style={styles.targetBox}>
                    <span style={styles.targetLabel}>찾아보세요!</span>
                    <span style={{ fontSize: '3rem' }}>{targetData?.image}</span>
                    {/* <span style={styles.targetWord}>{targetData?.word}</span> */}
                </div>

                <div style={styles.infoBox}>
                    <span style={styles.label}>시간</span>
                    <span style={styles.value}>{timeLeft}</span>
                </div>
            </div>

            {/* Game Grid */}
            <div style={styles.grid}>
                {moles.map((mole, index) => (
                    <div key={index} style={styles.hole}>
                        <div style={styles.holeBg}></div>
                        <AnimatePresence>
                            {mole.active && (
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: '0%' }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    style={styles.mole}
                                    onClick={() => handleMoleClick(index)}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <div style={styles.moleEarLeft}></div>
                                    <div style={styles.moleEarRight}></div>
                                    <span style={{ fontSize: '1.5rem', color: '#FFF', fontWeight: 'bold', zIndex: 10, textShadow: '1px 1px 0 #5D4037' }}>
                                        {mole.content}
                                    </span>
                                    <div style={styles.moleFace}>
                                        <div style={styles.moleEye}>
                                            <div style={styles.moleEyeSparkle}></div>
                                        </div>
                                        <div style={styles.moleNose}></div>
                                        <div style={styles.moleEye}>
                                            <div style={styles.moleEyeSparkle}></div>
                                        </div>
                                        <div style={styles.moleCheekLeft}></div>
                                        <div style={styles.moleCheekRight}></div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Mask to hide mole when down */}
                        <div style={styles.holeMask}></div>
                    </div>
                ))}
            </div>

            {/* Game Over Modal */}
            {!isPlaying && timeLeft === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.modal}
                >
                    <h2>게임 종료!</h2>
                    <p style={{ fontSize: '2rem' }}>최종 점수: {score}점</p>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            stopGame();
                            startGame();
                        }}
                        style={styles.restartButton}
                    >
                        다시 하기
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/mode-select')}
                        style={{ ...styles.restartButton, backgroundColor: '#78909C', marginTop: '10px' }}
                    >
                        나가기
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        height: '100vh',
        backgroundColor: '#81C784', // Green Grass background
        fontFamily: '"Jua", sans-serif',
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        marginTop: '50px', // Push down score/target board
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '10px 20px',
        borderRadius: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 10,
    },
    infoBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    label: {
        fontSize: '1rem',
        color: '#555',
    },
    value: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        color: '#333',
    },
    targetBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    targetLabel: {
        fontSize: '1rem',
        color: '#D84315',
        marginBottom: '5px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '1',
    },
    hole: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        overflow: 'hidden', // Hide mole when down
        borderRadius: '50%', // Circular mask effect at bottom? No, just mask active area
    },
    holeBg: {
        position: 'absolute',
        bottom: 0,
        width: '80%',
        height: '30%',
        backgroundColor: '#3E2723', // Dark Dirt
        borderRadius: '50%',
        zIndex: 1,
    },
    holeMask: {
        position: 'absolute',
        top: '100%', // Below the hole
        width: '100%',
        height: '100%',
        backgroundColor: '#81C784', // Match background to mask
        zIndex: 5,
    },
    mole: {
        position: 'absolute',
        bottom: '15%',
        width: '70%',
        height: '75%', // Slightly taller
        backgroundColor: '#8D6E63', // Warm Brown
        borderRadius: '50% 50% 15% 15%', // Rounder top
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        cursor: 'pointer',
        boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.2)', // Better depth
    },
    moleEarLeft: {
        position: 'absolute',
        top: '-10%',
        left: '10%',
        width: '25%',
        height: '25%',
        backgroundColor: '#8D6E63',
        borderRadius: '50%',
        zIndex: -1, // Behind head
    },
    moleEarRight: {
        position: 'absolute',
        top: '-10%',
        right: '10%',
        width: '25%',
        height: '25%',
        backgroundColor: '#8D6E63',
        borderRadius: '50%',
        zIndex: -1,
    },
    moleFace: {
        marginTop: '2px',
        position: 'relative',
        width: '100%',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moleEye: {
        width: '8px',
        height: '8px',
        backgroundColor: '#333',
        borderRadius: '50%',
        margin: '0 8px',
        position: 'relative',
    },
    moleEyeSparkle: {
        width: '3px',
        height: '3px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '1px',
        right: '1px',
    },
    moleNose: {
        width: '14px',
        height: '10px',
        backgroundColor: '#FFAB91', // Pinkish nose
        borderRadius: '40%',
        marginTop: '5px',
    },
    moleCheekLeft: {
        position: 'absolute',
        top: '15px',
        left: '15%',
        width: '10px',
        height: '6px',
        backgroundColor: '#FFAB91',
        borderRadius: '50%',
        opacity: 0.6,
    },
    moleCheekRight: {
        position: 'absolute',
        top: '15px',
        right: '15%',
        width: '10px',
        height: '6px',
        backgroundColor: '#FFAB91',
        borderRadius: '50%',
        opacity: 0.6,
    },
    modal: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        zIndex: 100,
        width: '80%',
        maxWidth: '400px',
    },
    restartButton: {
        width: '100%',
        padding: '15px 0',
        fontSize: '1.5rem',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '15px',
        cursor: 'pointer',
        marginTop: '20px',
        fontFamily: '"Jua", sans-serif',
    }
};
