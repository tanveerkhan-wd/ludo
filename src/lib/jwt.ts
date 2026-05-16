import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'bajiger_ludo_secret_key_1234567890_at_least_32_chars';
const key = new TextEncoder().encode(JWT_SECRET);

interface TokenPayload {
  id: string;
  userType: string;
  [key: string]: any;
}

export const signToken = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
};

export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as TokenPayload;
  } catch (error) {
    // console.error('JWT Verification Error:', error);
    return null;
  }
};
