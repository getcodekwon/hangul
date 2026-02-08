import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const colors = [
    '#000000', // Black
    '#F44336', // Red
    '#FF9800', // Orange
    '#FFEB3B', // Yellow
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
];

const TracingScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [showSuccess, setShowSuccess] = useState(false);

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas size to display size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 15;
        ctx.strokeStyle = color;

        // Draw Guide Character (Light Gray)
        drawGuide(ctx, id);

        // Handle resize
        const handleResize = () => {
            // Basic resize handler - clears canvas for now, ideally would redraw strokes
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawGuide(ctx, id);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);

    // Update color
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
    }, [color]);

    const drawGuide = (ctx, char) => {
        ctx.save();
        ctx.font = 'bold 400px "Gamja Flower", cursive';
        ctx.fillStyle = '#EEEEEE'; // Very light gray
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Dashed outline effect
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#CCCCCC';

        const x = ctx.canvas.width / 2;
        const y = ctx.canvas.height / 2;

        ctx.fillText(char, x, y);
        ctx.strokeText(char, x, y);
        ctx.restore();
    };

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath(); // Reset path
    };

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }
        return { x, y };
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGuide(ctx, id);
    };

    const handleDone = () => {
        // Celebration
        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
        setShowSuccess(true);
        setTimeout(() => {
            navigate('/select/tracing');
        }, 3000);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button onClick={() => navigate('/select/tracing')} style={styles.backButton}>이전으로</button>
                <h1 style={styles.title}>따라 써보세요: {id}</h1>
                <div style={{ width: 100 }}></div> {/* Spacer */}
            </div>

            {/* Canvas Area */}
            <div style={styles.canvasContainer}>
                <canvas
                    ref={canvasRef}
                    style={styles.canvas}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                />
            </div>

            {/* Controls */}
            <div style={styles.controls}>
                <div style={styles.palette}>
                    {colors.map(c => (
                        <motion.button
                            key={c}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setColor(c)}
                            style={{
                                ...styles.colorBtn,
                                backgroundColor: c,
                                border: color === c ? '4px solid white' : 'none',
                                boxShadow: color === c ? '0 0 10px rgba(0,0,0,0.5)' : 'none',
                                transform: color === c ? 'scale(1.2)' : 'scale(1)'
                            }}
                        />
                    ))}
                </div>

                <div style={styles.actions}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={clearCanvas}
                        style={styles.actionBtn}
                    >
                        지우기
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDone}
                        style={{ ...styles.actionBtn, background: '#4CAF50', color: 'white' }}
                    >
                        다 썼어요!
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.successOverlay}
                    >
                        <div style={{ fontSize: '5rem', fontWeight: 'bold', color: 'white' }}>참 잘했어요!</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #FFEB3B 0%, #8BC34A 100%)', // Fun gradient
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    header: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    backButton: {
        padding: '10px 20px',
        fontSize: '1.2rem',
        borderRadius: '15px',
        border: 'none',
        background: 'white',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: '"Gamja Flower", cursive',
    },
    title: {
        fontSize: '3rem',
        color: '#333',
        margin: 0,
        fontFamily: '"Gamja Flower", cursive',
    },
    canvasContainer: {
        flex: 1,
        width: '100%',
        maxWidth: '800px',
        background: 'white',
        borderRadius: '30px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        position: 'relative',
        cursor: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewport=\"0 0 24 24\" fill=\"black\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>') 12 12, auto",
    },
    canvas: {
        width: '100%',
        height: '100%',
        touchAction: 'none', // Critical for preventing scrolling while drawing
    },
    controls: {
        width: '100%',
        maxWidth: '800px',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    palette: {
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        padding: '10px',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '20px',
    },
    colorBtn: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    actions: {
        display: 'flex',
        justifyContent: 'space-around',
    },
    actionBtn: {
        padding: '15px 40px',
        fontSize: '1.5rem',
        borderRadius: '20px',
        border: 'none',
        background: 'white',
        color: '#333',
        cursor: 'pointer',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        fontFamily: '"Gamja Flower", cursive',
        fontWeight: 'bold',
    },
    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        pointerEvents: 'none',
    }
};

export { TracingScreen };
