import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Create container for the extension
const container = document.createElement('div');
container.id = 'focuzstreak-extension-root';
document.body.appendChild(container);

// Initialize React
createRoot(container).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);