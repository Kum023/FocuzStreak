import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import OverlayMode from './components/OverlayMode';
import AnimatedLion from './components/AnimatedLion';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <OverlayMode>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="shop" element={<Shop />} />
            </Route>
          </Routes>
        </OverlayMode>
        <AnimatedLion />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App