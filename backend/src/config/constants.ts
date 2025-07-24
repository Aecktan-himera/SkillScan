export const JWT_EXPIRES_IN = "7d";
export const DEFAULT_TEST_TIMER = 30;
export const DEFAULT_DARK_MODE = false;
export const QUESTIONS_PER_TEST = 10;
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
/*export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'securePassword123',
  email: process.env.ADMIN_EMAIL || 'admin@domain.com'
};*/