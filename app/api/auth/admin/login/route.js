import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import crypto from 'crypto';

const ADMIN_SESSION_COOKIE = 'quizzquest_admin_session';
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin';
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

function getAdminPasswordHash() {
  return process.env.ADMIN_PASSWORD_HASH || '';
}

function signPayload(payload) {
  const secret = process.env.NEXTAUTH_SECRET || 'quizzquest-local-dev-secret';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function serializeSession(username) {
  const payload = JSON.stringify({
    sub: username,
    type: 'admin',
    exp: Date.now() + ADMIN_SESSION_TTL_MS,
  });

  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = signPayload(payload);
  return `${encoded}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const [payloadSegment, signature] = token.split('.');
  if (!payloadSegment || !signature) return null;

  const payload = Buffer.from(payloadSegment, 'base64url').toString('utf8');
  const expectedSignature = signPayload(payload);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload);
    if (parsed?.type !== 'admin') return null;
    if (parsed.exp && Date.now() > Number(parsed.exp)) return null;
    return parsed.sub || null;
  } catch {
    return null;
  }
}

export async function isValidAdminCredentials(username, password) {
  if (!username || !password) return false;

  const adminUsername = getAdminUsername();
  if (username !== adminUsername) return false;

  const passwordHash = getAdminPasswordHash();
  if (passwordHash) {
    try {
      return await compare(password, passwordHash);
    } catch {
      return false;
    }
  }

  return password === getAdminPassword();
}

export function getAdminSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = new Map();

  for (const segment of cookieHeader.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;
    const name = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    cookies.set(name, value);
  }

  const token = cookies.get(ADMIN_SESSION_COOKIE);
  return verifySessionToken(token);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');

    const isValid = await isValidAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, username });
    response.cookies.set(ADMIN_SESSION_COOKIE, serializeSession(username), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  }
}

export function GET(request) {
  const username = getAdminSessionFromRequest(request);
  if (!username) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username });
}

export function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
