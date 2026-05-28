import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_change_me'
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jose.jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
