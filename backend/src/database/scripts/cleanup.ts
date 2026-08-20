import 'reflect-metadata';
import { AppDataSource } from '../data-source';

// Never truncate these: they track schema/migration state, not business
// data. Wiping "migrations" would make TypeORM think no migrations have
// ever run, and it would try to re-apply them against a schema that
// already has the columns/tables — that fails loudly.
const EXCLUDED_TABLES = ['migrations', 'typeorm_metadata'];

async function cleanup() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[cleanup] Refusing to run with NODE_ENV=production. Aborting.');
    process.exit(1);
  }

  await AppDataSource.initialize();
  console.log('[cleanup] Data source initialized.');

  const tables: { table_name: string }[] = await AppDataSource.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  );

  const targetTables = tables
    .map((t) => t.table_name)
    .filter((name) => !EXCLUDED_TABLES.includes(name));

  if (targetTables.length === 0) {
    console.log('[cleanup] No tables found to truncate.');
    await AppDataSource.destroy();
    return;
  }

  const tableList = targetTables.map((name) => `"${name}"`).join(', ');
  console.log(`[cleanup] Truncating: ${targetTables.join(', ')}`);

  await AppDataSource.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);

  console.log('[cleanup] All data tables truncated. Schema left intact.');
  await AppDataSource.destroy();
}

cleanup().catch((err) => {
  console.error('[cleanup] Failed:', err);
  process.exit(1);
});
