import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/themes/theme.css';
import './index.css';
import App from './App.tsx';
//import { makeServer} from './mocks/server.ts';

/*if (process.env.NODE_ENV === 'development') {
  makeServer({ environment: 'development' });
} */

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
