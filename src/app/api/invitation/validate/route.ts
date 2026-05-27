import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ message: 'Token requerido' }, { status: 400 });
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ message: 'Token no encontrado' }, { status: 404 });
    }

    if (invitation.used) {
      return NextResponse.json({ message: 'Esta invitación ya ha sido utilizada' }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ message: 'La invitación ha expirado' }, { status: 400 });
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al validar token' }, { status: 500 });
  }
}
