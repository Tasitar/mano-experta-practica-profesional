import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './tailwind.css';
import { SesionProvider } from './context/sesionContext';
import App from './app';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <SesionProvider>
                <App />
            </SesionProvider>
        </BrowserRouter>
    </React.StrictMode>
);