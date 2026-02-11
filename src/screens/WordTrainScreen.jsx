import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, Reorder } from 'framer-motion';
import confetti from 'canvas-confetti';

// Simple data for initial version
const WORD_DATA = [
    { id: 0, word: "바나나", image: "🍌" },
    { id: 1, word: "사자", image: "🦁" },
    { id: 2, word: "자동차", image: "🚗" },
    { id: 3, word: "우산", image: "☂️" },
];

export function WordTrainScreen() {
    const navigate = useNavigate();
    const { id } = useParams();
    const currentLevelIndex = parseInt(id) || 0;
    const currentData = WORD_DATA[currentLevelIndex % WORD_DATA.length];

    const [items, setItems] = useState([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        // Prepare scrambled letters
        const letters = currentData.word.split('').map((char, index) => ({
            id: `${char}-${index}`,
            char: char
        }));
        // Shuffle (simple shuffle)
        setItems(letters.sort(() => Math.random() - 0.5));
        setIsComplete(false);
    }, [currentLevelIndex]);

    const checkAnswer = (newOrder) => {
        const formedWord = newOrder.map(item => item.char).join('');
        if (formedWord === currentData.word) {
            setIsComplete(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            // Auto advance after delay
            setTimeout(() => {
                navigate(`/game/train/${currentLevelIndex + 1}`);
            }, 2000);
        }
    };

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
                <div style={styles.progress}>
                    문제 {currentLevelIndex + 1}
                </div>
            </div>

            {/* Image Area */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={styles.imageContainer}
            >
                <span style={{ fontSize: '100px' }}>{currentData.image}</span>
            </motion.div>

            <h2 style={styles.instruction}>글자 기차를 순서대로 맞춰보세요!</h2>

            {/* Train Area (Draggable List) */}
            <Reorder.Group
                axis="x"
                values={items}
                onReorder={(newOrder) => {
                    setItems(newOrder);
                    checkAnswer(newOrder);
                }}
                style={styles.trainContainer}
            >
                {items.map((item) => (
                    <Reorder.Item key={item.id} value={item} style={styles.trainCar}>
                        <div style={styles.trainBody}>
                            {item.char}
                        </div>
                        <div style={styles.wheelLeft}></div>
                        <div style={styles.wheelRight}></div>
                        <div style={styles.connector}></div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {isComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.successMessage}
                >
                    참 잘했어요!
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
        backgroundColor: '#E0F7FA', // Light Cyan background
        fontFamily: '"Jua", sans-serif',
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    homeButton: {
        background: 'none',
        border: 'none',
        fontSize: '2rem',
        cursor: 'pointer',
    },
    progress: {
        fontSize: '1.5rem',
        color: '#006064',
    },
    imageContainer: {
        backgroundColor: 'white',
        borderRadius: '50%',
        width: '200px',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        marginBottom: '40px',
    },
    instruction: {
        color: '#00838F',
        marginBottom: '30px',
    },
    trainContainer: {
        display: 'flex',
        gap: '10px',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        // Allow horizontal scroll if needed, but centering is better for short words
        justifyContent: 'center',
        width: '100%',
    },
    trainCar: {
        width: '100px',
        height: '100px',
        position: 'relative',
        cursor: 'grab',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trainBody: {
        width: '90px',
        height: '80px',
        backgroundColor: '#FF7043',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '3rem',
        color: 'white',
        boxShadow: '0 5px 0 #D84315',
        zIndex: 2,
    },
    wheelLeft: {
        position: 'absolute',
        bottom: '5px',
        left: '15px',
        width: '20px',
        height: '20px',
        backgroundColor: '#333',
        borderRadius: '50%',
        zIndex: 3,
    },
    wheelRight: {
        position: 'absolute',
        bottom: '5px',
        right: '15px',
        width: '20px',
        height: '20px',
        backgroundColor: '#333',
        borderRadius: '50%',
        zIndex: 3,
    },
    connector: {
        position: 'absolute',
        right: '-10px',
        top: '50%',
        width: '20px',
        height: '10px',
        backgroundColor: '#555',
        zIndex: 1,
    },
    successMessage: {
        marginTop: '30px',
        fontSize: '3rem',
        color: '#4CAF50',
        fontWeight: 'bold',
        textShadow: '2px 2px 0 white',
    }
};
