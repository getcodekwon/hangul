import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { EXPANDED_WORDS } from '../data/expandedWords';
import { CONSONANTS, combineHangul } from '../data/vowels';

export function GameScreen() {
    const { mode, id } = useParams(); // mode: 'vowel' | 'consonant', id: char (e.g. 'ㅏ' or 'ㄱ')
    const navigate = useNavigate();

    // State
    const [phase, setPhase] = useState('loading');
    const [round, setRound] = useState(0);
    const [roundQueue, setRoundQueue] = useState([]);
    const [targetWord, setTargetWord] = useState(null);

    // Derived state
    const targetConsonant = targetWord?.consonant || '';
    const targetSyllable = targetWord?.char || '';
    // Consonant Mode: id is the consonant. Vowel Mode: id is the vowel.
    const currentVowel = mode === 'vowel' ? id : (targetWord?.vowel || '');

    // Quiz State
    const [quizOptions, setQuizOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [wrongSelection, setWrongSelection] = useState(null);

    const MAX_ROUNDS = 6;

    // Initialize Game Session on Mount
    useEffect(() => {
        let availableWords = [];
        let newQueue = [];

        if (mode === 'vowel') {
            // --- VOWEL MODE ---
            // 1. Filter words for current vowel AND length >= 2
            availableWords = EXPANDED_WORDS.filter(w => w.vowel === id && w.word.length >= 2);

            // 2. Group by Consonant to ensure uniqueness (Round Queue Logic)
            const wordsByConsonant = {};
            availableWords.forEach(w => {
                if (!wordsByConsonant[w.consonant]) wordsByConsonant[w.consonant] = [];
                wordsByConsonant[w.consonant].push(w);
            });

            // 3. Pick unique consonants
            const uniqueConsonants = Object.keys(wordsByConsonant);
            const shuffledConsonants = uniqueConsonants.sort(() => 0.5 - Math.random()).slice(0, MAX_ROUNDS);

            // 4. Create Round Queue
            newQueue = shuffledConsonants.map(cons => {
                const words = wordsByConsonant[cons];
                return words[Math.floor(Math.random() * words.length)];
            });

        } else if (mode === 'consonant') {
            // --- CONSONANT MODE ---
            // 1. Filter words for current consonant AND length >= 2
            availableWords = EXPANDED_WORDS.filter(w => w.consonant === id && w.word.length >= 2);

            // 2. Group by Vowel to ensure variety (try to show different vowels)
            const wordsByVowel = {};
            availableWords.forEach(w => {
                if (!wordsByVowel[w.vowel]) wordsByVowel[w.vowel] = [];
                wordsByVowel[w.vowel].push(w);
            });

            // 3. Pick unique vowels
            const uniqueVowels = Object.keys(wordsByVowel);

            // Check if we have enough unique vowels
            if (uniqueVowels.length >= MAX_ROUNDS) {
                // Perfect! Pick 6 unique vowels
                const shuffledVowels = uniqueVowels.sort(() => 0.5 - Math.random()).slice(0, MAX_ROUNDS);
                newQueue = shuffledVowels.map(v => {
                    const words = wordsByVowel[v];
                    return words[Math.floor(Math.random() * words.length)];
                });
            } else {
                // Not enough unique vowels? (Should rarely happen now with augmented data)
                // Fill up with unique vowels first, then random remaining words
                console.warn(`Consonant ${id} has only ${uniqueVowels.length} unique vowel words.`);

                let pickedWords = [];
                // 1. Pick 1 from each unique vowel
                uniqueVowels.forEach(v => {
                    const words = wordsByVowel[v];
                    pickedWords.push(words[Math.floor(Math.random() * words.length)]);
                });

                // 2. Fill remainder from remaining available words (excluding already picked? No, simple shuffle remaining is easier)
                // Actually, just shuffle all availableWords and unique filter?
                // No, priority is Unique Vowel.
                // Let's just shuffle availableWords but prioritize the unique set we built?
                // Simple fallback: If not enough unique vowels, Just shuffle all availableWords and take 6.
                // It won't be perfectly unique, but playable.
                const remainingNeeded = MAX_ROUNDS - pickedWords.length;
                if (remainingNeeded > 0) {
                    const usedWords = new Set(pickedWords.map(w => w.word));
                    const others = availableWords.filter(w => !usedWords.has(w.word));
                    pickedWords = [...pickedWords, ...others.sort(() => 0.5 - Math.random()).slice(0, remainingNeeded)];
                }
                newQueue = pickedWords;
            }
        }

        if (newQueue.length < MAX_ROUNDS) {
            console.warn(`Not enough words for ${mode}: ${id}`);
        }

        setRoundQueue(newQueue);
        setRound(0);
        setPhase('ready');
    }, [mode, id]);

    // Start Round Trigger
    useEffect(() => {
        if (phase === 'ready' && roundQueue.length > 0) {
            setTargetWord(roundQueue[0]);
            setPhase('compose');
        }
    }, [phase, roundQueue]);

    const startNextRound = () => {
        const nextRound = round + 1;
        if (nextRound >= roundQueue.length) {
            navigate(`/select/${mode}`); // Go back to selection for current mode
            return;
        }
        setRound(nextRound);
        setTargetWord(roundQueue[nextRound]);
        setFeedback(null);
        setPhase('compose');
    };

    // Handle Composition Phase End (Automatic after 10s)
    useEffect(() => {
        if (phase === 'compose') {
            const timer = setTimeout(() => {
                setupQuiz();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [phase, targetWord]);

    const setupQuiz = () => {
        if (!targetWord) return;

        const correctWordObj = targetWord;
        let incorrectWords = [];

        if (mode === 'vowel') {
            // Vowel Mode Logic: Incorrect options must NOT contain target char 
            // (AND ideally not share vowel to avoid confusion? No, sharing vowel is hard to avoid, 
            // actually standard logic was: filter out words that HAVE the target char).
            incorrectWords = EXPANDED_WORDS.filter(w =>
                w.char !== targetWord.char &&
                !w.word.includes(targetWord.char) &&
                w.word.length >= 2
            );
        } else {
            // Consonant Mode Logic: 
            // Target is '가방' (ㄱ). Incorrect options should NOT start with 'ㄱ'.
            // Also exclude words containing the target char for safety.
            incorrectWords = EXPANDED_WORDS.filter(w =>
                w.consonant !== id && // Must different consonant
                w.char !== targetWord.char &&
                !w.word.includes(targetWord.char) &&
                w.word.length >= 2
            );
        }

        const shuffledIncorrect = [...incorrectWords].sort(() => 0.5 - Math.random()).slice(0, 3);
        const allOptions = [correctWordObj, ...shuffledIncorrect].sort(() => 0.5 - Math.random());

        setQuizOptions(allOptions);
        setPhase('quiz');
    };

    const handleOptionClick = (wordObj) => {
        if (feedback === 'correct') return;

        // Check Logic:
        // Vowel Mode: Does wordObj.char match targetWord.char? (e.g. '가')
        // Consonant Mode: Same check. The target word is the correct answer.
        // Actually, previous logic: `if (wordObj.char === targetWord.char)`
        // This relies on the fact that `wordObj` IS `targetWord` (or same char).
        // Since we allow duplicate words in data? No, words are unique.
        // So checking `wordObj.word === targetWord.word` is safer?
        // Let's stick to `char` if unique enough, but `word` is best.
        // Wait, multiple words might have '가' (가방, 가지).
        // If target is '가방', represents '가'.
        // If user clicks '가지' (also '가'), is it correct?
        // In Vowel game, we filtered by UNIQUE Consonant. So only ONE 'ㄱ+ㅏ' exists.
        // In Consonant game, duplicate vowels are possible. e.g. Target '가방' (ㄱ+ㅏ), Distractor '거미' (ㄱ+ㅓ... not supported yet), '구두' (ㄱ+ㅜ).
        // But Distractors in Consonant Mode are DIFFERENT Consonants (e.g. '나비').
        // So `char` check works if `char` is unique in the set.
        // BUT: What if Target='가방', and we have another '가' word?
        // In Consonant Mode, we pick random 6 words.
        // If we picked '가방' and '가지' in the same game session (different rounds), that's fine.
        // In a single Quiz, options are 1 correct + 3 distractor (diff consonant).
        // So `char` check `wordObj.char === targetWord.char` is valid because distractors won't have 'ㄱ'.

        if (wordObj.word === targetWord.word) {
            // Use strict word match for safety, though char match likely works too.
            setFeedback('correct');
            confetti({ particleCount: 150, spread: 80 });
            setTimeout(() => {
                startNextRound();
            }, 2000);
        } else {
            setFeedback('wrong');
            setWrongSelection(wordObj.word);
            setTimeout(() => {
                setFeedback(null);
                setWrongSelection(null);
            }, 1000);
        }
    };

    if (phase === 'loading') {
        return <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    if (phase === 'ready' && roundQueue.length === 0) {
        return (
            <div style={{ ...styles.container, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h2>배울 단어가 부족해요! ({mode}: {id})</h2>
                <motion.button onClick={() => navigate(`/select/${mode}`)} style={styles.navButton}>돌아가기</motion.button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Navigation Buttons */}
            <div style={styles.navContainer}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(`/select/${mode}`)}
                    style={styles.navButton}
                >
                    다른 글자
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/mode-select')}
                    style={styles.navButton}
                >
                    게임 선택
                </motion.button>
            </div>

            {phase === 'compose' && targetWord && (
                <CompositionView
                    key="compose"
                    consonant={targetConsonant}
                    vowel={currentVowel}
                    syllable={targetSyllable}
                />
            )}
            {phase === 'quiz' && targetWord && (
                <QuizView
                    key="quiz"
                    targetSyllable={targetSyllable}
                    options={quizOptions}
                    onOptionClick={handleOptionClick}
                    feedback={feedback}
                    wrongSelection={wrongSelection}
                />
            )}
        </div>
    );
}

// Sub-component: Composition Animation (10s)
function CompositionView({ consonant, vowel, syllable }) {
    // Determine direction based on vowel
    // Horizontal: ㅏ, ㅐ, ㅣ
    // Vertical: ㅗ, ㅜ (Consonant top, Vowel bottom)
    const isVertical = ['ㅗ', 'ㅜ'].includes(vowel);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Consonant Style
    const charStyle = {
        ...styles.partChar,
        opacity: animate ? 0 : 1, // Fade out as they merge
        transition: 'all 2s ease-in-out',
        // Move towards center
        ...(isVertical
            ? { top: animate ? '50%' : '50px', left: '50%', transform: animate ? 'translate(-50%, -50%) scale(0.5)' : 'translateX(-50%)' }
            : { left: animate ? '50%' : '50px', top: '50%', transform: animate ? 'translate(-50%, -50%) scale(0.5)' : 'translateY(-50%)' })
    };

    // Vowel Style - Moves towards center
    const vowelStyle = {
        ...styles.partChar,
        opacity: animate ? 0 : 1, // Fade out
        transition: 'all 2s ease-in-out',
        ...(isVertical
            // Vertical Mode (ㅗ, ㅜ): Bottom -> Center
            ? { bottom: animate ? '50%' : '50px', left: '50%', transform: animate ? 'translate(-50%, 50%) scale(0.5)' : 'translateX(-50%)' }
            // Horizontal Mode (ㅏ, ㅐ, ㅣ): Right -> Center
            // Fix: Use translate(50%, -50%) to compensate for right: 50%
            : { right: animate ? '50%' : '50px', top: '50%', transform: animate ? 'translate(50%, -50%) scale(0.5)' : 'translateY(-50%)' })
    };

    return (
        <div style={styles.composeContainer}>
            <div style={styles.composeStage}>
                {/* Consonant */}
                <div style={charStyle}>
                    {consonant}
                </div>

                {/* Vowel */}
                <div style={vowelStyle}>
                    {vowel}
                </div>

                {/* Result: Syllable (Fades in at center) */}
                <div style={{
                    ...styles.resultChar,
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'scale(1)' : 'scale(0.5)',
                    transition: 'all 2s ease-out 1s' // Delay 1s
                }}>
                    {syllable}
                </div>
            </div>
            <div style={{
                ...styles.instruction,
                opacity: animate ? 1 : 0,
                transition: 'opacity 1s ease-out 2s' // Delay 2s
            }}>
                {consonant}와 {vowel}가 만나서 <span style={{ color: '#6B8E23' }}>{syllable}</span>가 돼요!
            </div>
        </div>
    );
}

// Sub-component: Quiz View
function QuizView({ targetSyllable, options, onOptionClick, feedback, wrongSelection }) {
    return (
        <div style={styles.quizContainer}>
            <div style={styles.leftPanel}>
                <motion.div
                    key={targetSyllable} // Key to trigger re-animation on targetSyllable change
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={styles.targetChar}
                >
                    {targetSyllable}
                </motion.div>
                <p style={styles.quizInstruction}>어떤 단어에 {targetSyllable}가 들어갈까요?</p>
            </div>
            <div style={styles.rightPanel}>
                <AnimatePresence mode="wait">
                    {options.map((option, index) => (
                        <div key={option.word} style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    scale: feedback === 'correct' && option.char === targetSyllable ? [1, 1.05, 1] : 1,
                                    borderColor: feedback === 'correct' && option.char === targetSyllable ? '#4CAF50' :
                                        feedback === 'wrong' && option.word === wrongSelection ? '#F44336' : '#fff'
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    ...styles.card,
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    zIndex: 1,
                                    borderWidth: '4px',
                                    borderStyle: 'solid',
                                    boxShadow: feedback === 'correct' && option.char === targetSyllable ? '0 0 20px rgba(76, 175, 80, 0.5)' :
                                        feedback === 'wrong' && option.word === wrongSelection ? '0 0 20px rgba(244, 67, 54, 0.5)' :
                                            '0 10px 20px rgba(0,0,0,0.1)',
                                }}
                                whileHover={{ scale: 1.05, zIndex: 2, boxShadow: '0 15px 30px rgba(0,0,0,0.2)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onOptionClick(option)}
                            >
                                {option.word}
                            </motion.div>

                            {/* Correct Overlay (O + 딩동댕) */}
                            {feedback === 'correct' && option.char === targetSyllable && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1, rotate: [0, 15, -15, 0] }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    style={styles.feedbackOverlay}
                                >
                                    <div style={{ fontSize: '10rem', color: '#4CAF50', fontWeight: 'bold' }}>O</div>
                                    <div style={{ fontSize: '3rem', color: '#4CAF50', marginTop: '-1rem' }}>딩동댕!</div>
                                </motion.div>
                            )}

                            {/* Incorrect Overlay (X + 땡) */}
                            {feedback === 'wrong' && option.word === wrongSelection && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    style={styles.feedbackOverlay}
                                >
                                    <div style={{ fontSize: '10rem', color: '#F44336', fontWeight: 'bold' }}>X</div>
                                    <div style={{ fontSize: '3rem', color: '#F44336', marginTop: '-1rem' }}>땡!</div>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#fff',
        fontFamily: '"Jua", sans-serif',
        position: 'relative',
    },
    navContainer: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        display: 'flex',
        gap: '1rem',
        zIndex: 100, // Ensure buttons are above game composition/quiz
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
    },
    // ... other styles ...
    composeContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAD2', // Light yellow for warmth
    },
    composeStage: {
        position: 'relative',
        height: '300px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    partChar: {
        fontSize: '8rem',
        color: '#555',
        position: 'absolute',
    },
    resultChar: {
        fontSize: '10rem',
        color: '#6B8E23', // Warm Green
        fontWeight: 'bold',
        zIndex: 10,
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '50%',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    },
    instruction: {
        fontSize: '2.5rem',
        marginTop: '2rem',
        color: '#555',
    },
    quizContainer: {
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    leftPanel: {
        flex: 1,
        background: '#fdfbfb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '5px solid #ffecd2',
    },
    targetChar: {
        fontSize: '15rem',
        color: '#6B8E23', // Warm Green
        textShadow: '4px 4px 0px #ffe66d',
    },
    quizInstruction: {
        fontSize: '2rem',
        marginTop: '2rem',
        color: '#555',
    },
    rightPanel: {
        flex: 1,
        padding: '2rem',
        paddingTop: '7rem', // Add space for top navigation buttons
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '2rem',
        backgroundColor: '#fff9c4',
        boxSizing: 'border-box', // Ensure padding doesn't affect width
    },
    card: {
        background: 'white',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        color: '#333',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        border: '4px solid #fff',
    }
};
