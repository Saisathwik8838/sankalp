import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { SankalpProvider } from './context/SankalpContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SankalpProvider>
      <App />
    </SankalpProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  });
}
