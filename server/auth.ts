import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, DBUser } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'silverharmony_production_jwt_secret_50_plus_2026';
const TOKEN_EXPIRY = '7d';

export interface AuthenticatedRequest extends Request {
  user?: DBUser;
  token?: string;
}

export function hashPassword(plainPassword: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
}

export function comparePassword(plainPassword: string, hash: string): boolean {
  return bcrypt.compareSync(plainPassword, hash);
}

export function generateToken(user: DBUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function calculateAge(dobString: string): number {
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Middleware: Authenticate incoming request via real JWT
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please log in with your Silver Harmony 50+ account to access this resource.',
    });
  }

  // Check if token was revoked
  const data = db.getData();
  if (data.revokedTokens && data.revokedTokens.includes(token)) {
    return res.status(401).json({
      error: 'Token Revoked',
      message: 'This session has been logged out. Please sign in again.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    const user = data.users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User Not Found',
        message: 'Account not found or no longer active.',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err: any) {
    return res.status(401).json({
      error: 'Invalid or Expired Token',
      message: 'Your session has expired. Please log in again.',
    });
  }
}

// Middleware: Require Admin role
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access Forbidden',
      message: 'Administrative privileges are required to perform this action.',
    });
  }
  next();
}

// Middleware: Require verified age 50+
export function requireAgeEligibility(dob: string): { valid: boolean; age: number; error?: string } {
  const age = calculateAge(dob);
  if (isNaN(age) || age < 50) {
    return {
      valid: false,
      age,
      error: 'Silver Harmony is exclusively dedicated to adults aged 50 and older. You must be at least 50 years old to register.',
    };
  }
  return { valid: true, age };
}

// Revoke a token
export function revokeToken(token: string) {
  const data = db.getData();
  if (!data.revokedTokens) {
    data.revokedTokens = [];
  }
  if (!data.revokedTokens.includes(token)) {
    data.revokedTokens.push(token);
    db.save();
  }
}

// Sanitize user for public display (stripping password and sensitive IDs)
export function sanitizeUserForClient(user: DBUser) {
  const { passwordHash, ...safeUser } = user;
  const city = user.privacySettings?.showCityOnly ? user.city : (user.city || 'Seattle');
  const state = user.state || 'WA';
  const distanceMiles = user.privacySettings?.showDistance ? user.distanceMiles : undefined;

  return {
    ...safeUser,
    city,
    state,
    distanceMiles,
    location: {
      city,
      state,
      country: user.country || 'United States',
      distanceMiles,
    },
  };
}
