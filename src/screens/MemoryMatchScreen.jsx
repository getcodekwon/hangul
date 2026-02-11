import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { WORDS } from '../data/wordData';

// Helper to shuffle array
const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

export function MemoryMatchScreen() {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [gameId, setGameId] = useState(0); // To reset game

    useEffect(() => {
        startNewGame();
    }, [gameId]);

    const startNewGame = () => {
        // 1. Select 6 random words
        const selectedWords = shuffle([...WORDS]).slice(0, 6);

        // 2. Create pairs (Image Card + Text Card)
        const newCards = [];
        selectedWords.forEach(wordData => {
            // Image Card
            newCards.push({
                id: `${wordData.id}-img`,
                wordId: wordData.id,
                content: wordData.image,
                type: 'image',
                isFlipped: false,
                isMatched: false
            });
            // Text Card
            newCards.push({
                id: `${wordData.id}-txt`,
                wordId: wordData.id,
                content: wordData.word,
                type: 'text',
                isFlipped: false,
                isMatched: false
            });
        });

        // 3. Shuffle cards
        setCards(shuffle(newCards));
        setFlippedIndices([]);
        setMatchedPairs([]);
        setIsLocked(false);
    };

    const handleCardClick = (index) => {
        // Prevent action if locked, already flipped, or already matched
        if (isLocked || flippedIndices.includes(index) || matchedPairs.includes(cards[index].wordId)) {
            return;
        }

        // Flip the card
        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        // Check if two cards are flipped
        if (newFlipped.length === 2) {
            setIsLocked(true);
            checkForMatch(newFlipped);
        }
    };

    const checkForMatch = (indices) => {
        const [index1, index2] = indices;
        const card1 = cards[index1];
        const card2 = cards[index2];

        if (card1.wordId === card2.wordId) {
            // Match found!
            setMatchedPairs(prev => [...prev, card1.wordId]);
            setFlippedIndices([]);
            setIsLocked(false);

            // Check win condition
            if (matchedPairs.length + 1 === cards.length / 2) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else {
            // No match, flip back after delay
            setTimeout(() => {
                setFlippedIndices([]);
                setIsLocked(false);
            }, 1000);
        }
    };

    const isGameComplete = matchedPairs.length === cards.length / 2;

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
                    단어 그림 짝꿍
                </div>
            </div>

            <div style={styles.grid}>
                {cards.map((card, index) => {
                    const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.wordId);
                    return (
                        <div key={card.id} style={styles.cardContainer} onClick={() => handleCardClick(index)}>
                            <motion.div
                                style={styles.cardInner}
                                animate={{ rotateY: isFlipped ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Front (Hidden) */}
                                <div style={styles.cardFront}>
                                    <span style={{ fontSize: '3rem', color: 'white' }}>?</span>
                                </div>
                                {/* Back (Revealed) */}
                                <div style={styles.cardBack}>
                                    <span style={{
                                        fontSize: card.type === 'image' ? '3rem' : '1.5rem',
                                        color: '#333'
                                    }}>
                                        {card.content}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
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
        backgroundColor: '#E3F2FD', // Light Blue background
        fontFamily: '"Jua", sans-serif',
        position: 'relative',
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
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
        color: '#1565C0',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: '3/4',
    },
    cardContainer: {
        perspective: '1000px',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
    },
    cardInner: {
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    cardFront: {
        position: 'absolute',
        width: '100%',
        height: '100%', // Changed from '120px' to fill container
        minHeight: '100px', // Min height for square look
        aspectRatio: '1',
        backfaceVisibility: 'hidden',
        backgroundColor: '#64B5F6',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBack: {
        position: 'absolute',
        width: '100%',
        height: '100%', // Changed from '120px'
        minHeight: '100px',
        aspectRatio: '1',
        backfaceVisibility: 'hidden',
        backgroundColor: 'white',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'rotateY(180deg)',
        border: '3px solid #64B5F6',
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
