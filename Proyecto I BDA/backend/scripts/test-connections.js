import { pgPool, mysqlPool, connectMongo, checkDatabaseHealth } from '../src/config/database.js';

async function testConnections() {
  console.log('🔍 Testing database connections...\n');

  try {
    // Connect MongoDB
    await connectMongo();

    // Check health
    const health = await checkDatabaseHealth();

    console.log('Database Health Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`PostgreSQL: ${health.postgres ? '✅ Connected' : '❌ Failed'}`);
    console.log(`MySQL:      ${health.mysql ? '✅ Connected' : '❌ Failed'}`);
    console.log(`MongoDB:    ${health.mongodb ? '✅ Connected' : '❌ Failed'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━\n');

    // Test queries
    if (health.postgres) {
      const pgResult = await pgPool.query('SELECT COUNT(*) as count FROM pages_metadata');
      console.log(`PostgreSQL: ${pgResult.rows[0].count} pages indexed`);
    }

    if (health.mysql) {
      const [mysqlResult] = await mysqlPool.query('SELECT COUNT(*) as count FROM pages_metadata_replica');
      console.log(`MySQL:      ${mysqlResult[0].count} pages replicated`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnections();