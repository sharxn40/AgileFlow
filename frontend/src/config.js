// Central API configuration.
// In development, this points to localhost.
// In production (deployed), Vite replaces this with the Cloud Run URL via .env.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default API_BASE_URL;
