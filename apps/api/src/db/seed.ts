import { db, pool } from './client';
import { tenants, users } from './schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('Seeding database...');

  const [tenant] = await db
    .insert(tenants)
    .values({ name: 'Demo Company' })
    .returning();

  const passwordHash = await bcrypt.hash('Password1', 12);

  await db.insert(users).values({
    tenantId: tenant.id,
    email: 'admin@demo.com',
    passwordHash,
    name: 'Demo Admin',
    role: 'admin',
  });

  console.log('Seed complete. Demo user: admin@demo.com / Password1');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
