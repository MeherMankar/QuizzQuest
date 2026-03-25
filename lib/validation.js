// Input validation utilities
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function validateQuizTopic(topic) {
  if (!topic || typeof topic !== 'string') return false;
  return topic.trim().length >= 2 && topic.trim().length <= 100;
}

export function validateNumberOfQuestions(num) {
  const parsed = parseInt(num);
  return !isNaN(parsed) && parsed >= 1 && parsed <= 20;
}