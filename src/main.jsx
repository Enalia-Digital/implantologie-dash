import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { IS_DEMO } from './data/demoMode';
import './index.css';

if (IS_DEMO && typeof document !== 'undefined') {
  document.title = 'IOI Aurora · Demo Enalia';
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
