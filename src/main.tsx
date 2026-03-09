import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root');

const isExtension = typeof chrome !== 'undefined' && chrome.runtime?.id;
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

createRoot(rootEl).render(
  <StrictMode>
    {isExtension ? (
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <App />
      </MemoryRouter>
    ) : (
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>
);