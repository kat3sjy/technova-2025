import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
if (import.meta.env.DEV) {
    window.addEventListener('error', (e) => {
        console.error('Window error:', e.error || e.message);
    });
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled rejection:', e.reason);
    });
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }));
