import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/index.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // basename : le site peut être servi dans un sous-dossier (ex : /Dentify/ sur GitHub Pages)
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <App />
  </BrowserRouter>
);