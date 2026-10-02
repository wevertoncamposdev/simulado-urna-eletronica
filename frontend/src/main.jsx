import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CurrentSessionProvider } from './hooks/useCurrentSession.jsx';
import './styles/globals.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CurrentSessionProvider>
        <App />
      </CurrentSessionProvider>
    </BrowserRouter>
  </StrictMode>,
);
