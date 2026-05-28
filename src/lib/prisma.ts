import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let databaseUrl: string | undefined = undefined;

if (process.env.NODE_ENV === 'production') {
  const absolutePath = '/home/u520553731/domains/bi.topaiventures.com/public_html/prisma/dev.db';
  const buildPath = '/home/u520553731/domains/bi.topaiventures.com/public_html/.builds/source/prisma/dev.db';
  
  if (fs.existsSync(absolutePath)) {
    databaseUrl = `file:${absolutePath}`;
  } else if (fs.existsSync(buildPath)) {
    databaseUrl = `file:${buildPath}`;
  } else {
    const localPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
    databaseUrl = `file:${localPath}`;
  }
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

