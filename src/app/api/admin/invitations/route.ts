import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_change_me'
);

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
  }

  try {
    const { email, role } = await request.json();
    
    // Generate a secure unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: role || 'USER',
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, token: invitation.token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al generar invitación' }, { status: 500 });
  }
}
