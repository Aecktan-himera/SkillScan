import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import 'virtual:uno.css';
import '@unocss/reset/tailwind.css';


const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
        <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
)
