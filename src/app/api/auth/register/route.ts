import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
    }

    // Find valid invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.used || invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Invitación inválida, usada o expirada' },
        { status: 400 }
      );
    }

    // Check if user already exists (safety)
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario ya está registrado' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and mark invitation as used in a transaction
    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invitation.email,
          password: hashedPassword,
          role: invitation.role,
          status: 'ACTIVE',
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error al procesar el registro' },
      { status: 500 }
    );
  }
}
