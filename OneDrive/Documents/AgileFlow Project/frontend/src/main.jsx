console.log('Main.jsx execution started');
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

// REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID FROM THE CONSOLE
const GOOGLE_CLIENT_ID = "245597536797-563me0qfcdetp5gaava66qfp1dm26u25.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
