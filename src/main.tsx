import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider, theme } from "@material-tailwind/react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider value={theme as any}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
