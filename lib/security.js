// Security configuration
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: false,

  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes

  // Session security
  SESSION_MAX_AGE: 24 * 60 * 60, // 24 hours
  SESSION_UPDATE_AGE: 60 * 60, // 1 hour

  // Input validation
  MAX_TOPIC_LENGTH: 100,
  MIN_TOPIC_LENGTH: 2,
  MAX_QUESTIONS_PER_QUIZ: 20,
  MIN_QUESTIONS_PER_QUIZ: 1,

  // CORS settings
  ALLOWED_ORIGINS: {
    development: ['http://localhost:3000'],
    production: [process.env.NEXTAUTH_URL]
  },

  // Content Security Policy
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
    'connect-src': ["'self'", 'https://api.together.xyz'],
    'worker-src': ["'self'", 'blob:']
  }
};

export function getCSPHeader() {
  return Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}