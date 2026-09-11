import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const url = process.env.DATABASE_URL;
if (!url || url.includes('REPLACE_ME') || url.includes('example.invalid')) {
  console.error('Set a real DATABASE_URL in .env.local before running npm run db:init.');
  process.exit(1);
}
try {
  const sql = neon(url);
  const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
  const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
  await sql.transaction(statements.map(statement => sql.query(statement, [])));
  console.log('Waitlist schema ready. Existing subscribers were preserved.');
} catch {
  console.error('Database setup failed. Check the connection string, database permissions, and network access.');
  process.exit(1);
}
