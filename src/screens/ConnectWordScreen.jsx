import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { WORDS } from '../data/wordData';

// Helper to shuffle array
const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

export function ConnectWordScreen() {
    const navigate = useNavigate();
    const [leftItems, setLeftItems] = useState([]);
    const [rightItems, setRightItems] = useState([]);
    const [selectedLeft, setSelectedLeft] = useState(null);
    const [matches, setMatches] = useState({}); // { leftId: rightId }
    const [wrongPair, setWrongPair] = useState(null);
    const [gameId, setGameId] = useState(0);

    useEffect(() => {
        startNewGame();
    }, [gameId]);

    const startNewGame = () => {
        // 1. Select 3 random words
        const selectedWords = shuffle([...WORDS]).slice(0, 3);

        // 2. Prepare left (Images) and right (Words) items
        const left = selectedWords.map(w => ({ id: w.id, content: w.image, type: 'image' }));
        const right = selectedWords.map(w => ({ id: w.id, content: w.word, type: 'text' }));

        setLeftItems(shuffle(left));
        setRightItems(shuffle(right));
        setSelectedLeft(null);
        setMatches({});
        setWrongPair(null);
    };

    const handleLeftClick = (item) => {
        if (matches[item.id]) return; // Already matched
        setSelectedLeft(item);
        setWrongPair(null);
    };

    const handleRightClick = (item) => {
        if (Object.values(matches).includes(item.id)) return; // Already matched

        if (selectedLeft) {
            if (selectedLeft.id === item.id) {
                // Match!
                setMatches(prev => ({ ...prev, [selectedLeft.id]: item.id }));
                setSelectedLeft(null);

                // Check win condition
                if (Object.keys(matches).length + 1 === 3) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            } else {
                // Wrong!
                setWrongPair({ left: selectedLeft.id, right: item.id });
                setTimeout(() => {
                    setWrongPair(null);
                    setSelectedLeft(null);
                }, 500);
            }
        }
    };

    const isGameComplete = Object.keys(matches).length === 3;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/mode-select')}
                    style={styles.homeButton}
                >
                    🏠
                </motion.button>
                <div style={styles.title}>
                    단어 잇기
                </div>
            </div>

            <h2 style={styles.instruction}>그림과 단어를 연결해보세요!</h2>

            <div style={styles.gameArea}>
                {/* Left Column (Images) */}
                <div style={styles.column}>
                    {leftItems.map((item) => {
                        const isMatched = matches[item.id];
                        const isSelected = selectedLeft?.id === item.id;
                        const isWrong = wrongPair?.left === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                style={{
                                    ...styles.item,
                                    backgroundColor: isMatched ? '#A5D6A7' : isSelected ? '#FFF59D' : 'white',
                                    borderColor: isSelected ? '#FBC02D' : '#eee',
                                }}
                                animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                                onClick={() => handleLeftClick(item)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span style={{ fontSize: '3rem' }}>{item.content}</span>
                                {isMatched && <span style={styles.checkMark}>✅</span>}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Right Column (Words) */}
                <div style={styles.column}>
                    {rightItems.map((item) => {
                        const isMatched = Object.values(matches).includes(item.id);
                        const isWrong = wrongPair?.right === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                style={{
                                    ...styles.item,
                                    backgroundColor: isMatched ? '#A5D6A7' : 'white',
                                }}
                                animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                                onClick={() => handleRightClick(item)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span style={{ fontSize: '1.5rem', color: '#333' }}>{item.content}</span>
                                {isMatched && <span style={styles.checkMark}>✅</span>}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {isGameComplete && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.modal}
                >
                    <h2>참 잘했어요!</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setGameId(id => id + 1)}
                        style={styles.restartButton}
                    >
                        다시 하기
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
        backgroundColor: '#FFEBEE', // Light Pink background
        fontFamily: '"Jua", sans-serif',
        position: 'relative',
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        maxWidth: '600px',
    },
    homeButton: {
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        cursor: 'pointer',
    },
    title: {
        fontSize: '1.8rem',
        color: '#D84315',
    },
    instruction: {
        color: '#BF360C',
        marginBottom: '20px',
    },
    gameArea: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '500px',
        gap: '40px',
    },
    column: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        flex: 1,
    },
    item: {
        height: '100px',
        backgroundColor: 'white',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        border: '3px solid transparent',
        position: 'relative',
    },
    checkMark: {
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        fontSize: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '50%',
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
    },
    restartButton: {
        padding: '15px 30px',
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
