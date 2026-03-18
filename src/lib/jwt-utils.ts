import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export interface VerificationTokenPayload {
  email: string;
  type: 'email_verification' | 'password_reset';
  role: 'user' | 'owner';
  userId?: string;
}

export function generateVerificationToken(payload: VerificationTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): VerificationTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as VerificationTokenPayload;
  } catch {
    return null;
  }
}