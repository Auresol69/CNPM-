// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import './fixLeafletIcon';

// Providers
import AuthProvider from './context/AuthProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Không tìm thấy element #root trong HTML. Vui lòng kiểm tra index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);