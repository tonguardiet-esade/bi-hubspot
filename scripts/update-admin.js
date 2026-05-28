const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Find existing admin(s) and update email
  const updated = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { email: 'hello@tonexecutive.ai' },
  });
  console.log('Updated admins:', updated.count);

  // Also upsert in case there was no admin yet
  const hashed = await bcrypt.hash('AdminPassword123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'hello@tonexecutive.ai' },
    update: { role: 'ADMIN', status: 'ACTIVE' },
    create: {
      email: 'hello@tonexecutive.ai',
      password: hashed,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('Admin:', admin.email, '| Role:', admin.role);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
