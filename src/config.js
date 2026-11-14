/**
 * Application Configuration
 * You can easily change the backend URL here or in the .env file (REACT_APP_API_URL)
 */

const rawApiUrl =
  process.env.REACT_APP_API_URL || 'https://sahusaathi.com';

// Clean trailing slash if present
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

const config = {
  API_BASE_URL,
};

export default config;
