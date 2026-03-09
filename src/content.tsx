import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Create container for the extension
const container = document.createElement('div');
container.id = 'focuzstreak-extension-root';
document.body.appendChild(container);

// Initialize React - MemoryRouter so path is always / (host page URL would break BrowserRouter)
createRoot(container).render(
  <MemoryRouter initialEntries={['/']} initialIndex={0}>
    <App />
  </MemoryRouter>
);