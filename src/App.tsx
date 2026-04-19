import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LevelSelect from './pages/LevelSelect';
import GameScreen from './pages/GameScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<LevelSelect />} />
        <Route path="/play/:levelId" element={<GameScreen />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
