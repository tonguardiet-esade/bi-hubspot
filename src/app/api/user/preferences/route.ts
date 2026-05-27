import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_change_me'
);

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get('tableId');

  if (!tableId) return NextResponse.json({ message: 'tableId requerido' }, { status: 400 });

  try {
    const prefs = await prisma.userPreference.findUnique({
      where: {
        userId_tableId: { userId, tableId },
      },
    });
    return NextResponse.json(prefs || {});
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ message: 'No autorizado' }, { status: 401 });

  try {
    const { tableId, columnOrder, visibleColumns } = await request.json();

    const prefs = await prisma.userPreference.upsert({
      where: {
        userId_tableId: { userId, tableId },
      },
      update: {
        columnOrder,
        visibleColumns,
      },
      create: {
        userId,
        tableId,
        columnOrder,
        visibleColumns,
      },
    });

    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json({ message: 'Error al guardar preferencias' }, { status: 500 });
  }
}
