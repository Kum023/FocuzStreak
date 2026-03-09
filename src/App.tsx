import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import OverlayMode from './components/OverlayMode';
import AnimatedLion from './components/AnimatedLion';
import FaceMeshOverlay from './components/FaceMeshOverlay';

const isExtension = typeof chrome !== 'undefined' && chrome.runtime?.id;

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        {!isExtension && (
          <div className="fixed top-0 left-0 z-[9999] w-[360px] overflow-hidden rounded-br-lg rounded-tr-lg shadow-lg pointer-events-none">
            <FaceMeshOverlay />
          </div>
        )}
        <OverlayMode>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="shop" element={<Shop />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OverlayMode>
        <AnimatedLion />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App