import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this client. Please try again after 15 minutes.'
  }
});

export const collectionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 collections per 5 minutes to prevent spamming
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Fingerprint collection rate limit exceeded. Please wait before running another scan.'
  }
});
