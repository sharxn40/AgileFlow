console.log('Main.jsx execution started');
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

// REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID FROM THE CONSOLE
const GOOGLE_CLIENT_ID = "768310526834-esa7heb11ecc5rj1khkqerg7a5bavol9.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>,
)
