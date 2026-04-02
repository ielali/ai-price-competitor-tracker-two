export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const Errors = {
  validationError: (message: string, details?: unknown) =>
    new AppError('VALIDATION_ERROR', message, 400, details),
  invalidCredentials: () =>
    new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401),
  tokenExpired: () =>
    new AppError('TOKEN_EXPIRED', 'Access token has expired', 401),
  tokenInvalid: () =>
    new AppError('TOKEN_INVALID', 'Invalid or missing token', 401),
  rateLimited: (retryAfter: number) =>
    new AppError('RATE_LIMITED', 'Too many requests. Please try again later.', 429, { retryAfter }),
  emailTaken: () =>
    new AppError('EMAIL_TAKEN', 'An account with this email already exists', 409),
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404),
  internalError: () =>
    new AppError('INTERNAL_ERROR', 'An internal server error occurred', 500),
};
