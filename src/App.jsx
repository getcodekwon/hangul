import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { IntroScreen, LandingScreen } from './screens/IntroScreens';
import { GameModeSelection } from './screens/GameModeSelection';
import { SelectionScreen } from './screens/SelectionScreen';
import { GameScreen } from './screens/GameScreen';
import { TracingScreen } from './screens/TracingScreen';
import { WordTrainScreen } from './screens/WordTrainScreen';
import { InitialSoundQuizScreen } from './screens/InitialSoundQuizScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/intro" element={<IntroScreen />} />
        <Route path="/mode-select" element={<GameModeSelection />} />
        <Route path="/select/:mode" element={<SelectionScreen />} />
        <Route path="/game/:mode/:id" element={<GameScreen />} />
        <Route path="/tracing/:id" element={<TracingScreen />} />
        <Route path="/game/train/:id" element={<WordTrainScreen />} />
        <Route path="/game/quiz/:id" element={<InitialSoundQuizScreen />} />
        {/* Redirect legacy routes if any */}
        <Route path="/select" element={<Navigate to="/select/vowel" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
