import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'bajiger_ludo_secret_key_1234567890_at_least_32_chars';
const key = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  id: string;
  userType: string;
  [key: string]: any;
}

async function signToken(payload: TokenPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

async function getUserFromRequest(req: Request | NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .find((c) => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) return null;
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

export { signToken, verifyToken, getUserFromRequest };
