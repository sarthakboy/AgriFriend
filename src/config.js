// Change this to switch between local and production
const IS_PRODUCTION = false;

export const API_URL = IS_PRODUCTION
  ? "https://agrifriend-backend.onrender.com"
  : "http://localhost:8000";
  