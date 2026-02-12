import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameHeader } from '../components/GameHeader';
import confetti from 'canvas-confetti';

import { WORDS } from '../data/wordData';

// Helper to get random incorrect initials
const getRandomInitials = (correctInitial, count = 3) => {
    const initials = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const options = [correctInitial];
    while (options.length < count + 1) {
        const randomInitial = initials[Math.floor(Math.random() * initials.length)];
        if (!options.includes(randomInitial)) {
            options.push(randomInitial);
        }
    }
    return options.sort(() => Math.random() - 0.5);
};

export function InitialSoundQuizScreen() {
    const navigate = useNavigate();
    const { id } = useParams();
    const currentQuestionIndex = parseInt(id) || 0;
    const currentData = WORDS[currentQuestionIndex % WORDS.length];

    // Memoize options so they don't change on re-renders (unless question changes)
    const options = React.useMemo(() => getRandomInitials(currentData.initial), [currentData.id]);

    const [isWrong, setIsWrong] = useState(false);

    const handleAnswer = (selectedInitial) => {
        if (selectedInitial === currentData.initial) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                navigate(`/game/quiz/${currentQuestionIndex + 1}`);
                setIsWrong(false);
            }, 1500);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <GameHeader>
                <div style={styles.progress}>
                    문제 {currentQuestionIndex + 1}
                </div>
            </GameHeader>

            <h2 style={styles.question}>이 그림의 첫 소리는 무엇일까요?</h2>

            {/* Image Area */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={styles.imageContainer}
            >
                <span style={{ fontSize: '120px' }}>{currentData.image}</span>
            </motion.div>

            {/* Options Area */}
            <div style={styles.optionsContainer}>
                {options.map((option, index) => (
                    <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                        onClick={() => handleAnswer(option)}
                        style={{ ...styles.optionButton, backgroundColor: getOptionColor(index) }}
                    >
                        {option}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

const getOptionColor = (index) => {
    const colors = ['#FF8A65', '#4DB6AC', '#7986CB', '#9575CD']; // Orange, Teal, Indigo, Deep Purple
    return colors[index % colors.length];
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        height: '100vh',
        backgroundColor: '#F3E5F5', // Light Purple background
        fontFamily: '"Jua", sans-serif',
    },
    // header removed
    // homeButton removed
    progress: {
        fontSize: '1.5rem',
        color: '#5E35B1',
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: '5px 15px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
    },
    question: {
        marginTop: '60px', // Add margin for absolute header
        color: '#512DA8',
        marginBottom: '30px',
        fontSize: '2rem',
        textAlign: 'center',
    },
    imageContainer: {
        backgroundColor: 'white',
        borderRadius: '20px',
        width: '250px',
        height: '250px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        marginBottom: '50px',
    },
    optionsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        width: '100%',
        maxWidth: '400px',
    },
    optionButton: {
        padding: '20px',
        fontSize: '2.5rem',
        borderRadius: '20px',
        border: 'none',
        color: 'white',
        boxShadow: '0 5px 0 rgba(0,0,0,0.2)',
        cursor: 'pointer',
        fontFamily: '"Jua", sans-serif',
    }
};
