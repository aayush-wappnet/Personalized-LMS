import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Role } from '../types/role';

dotenv.config();

export const generateToken = (payload: { id: number; email: string; role: Role }) => {
  const secret = process.env.JWT_SECRET as Secret;
  const expiresInSeconds = process.env.JWT_EXPIRES_IN ? parseDurationToSeconds(process.env.JWT_EXPIRES_IN) : 86400; // Default to 1 day (86400 seconds)
  const options: SignOptions = {
    expiresIn: expiresInSeconds,
  };
  return jwt.sign(payload, secret, options);
};

// Helper function to parse duration string to seconds
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error('Invalid duration format. Use e.g., "1d", "2h", "30m", "60s"');

  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'd': return value * 86400; // Days to seconds
    case 'h': return value * 3600;  // Hours to seconds
    case 'm': return value * 60;    // Minutes to seconds
    case 's': return value;         // Seconds
    default: throw new Error('Unsupported duration unit');
  }
}