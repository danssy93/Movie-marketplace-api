import dbConn from './db.config';
import { ADMIN, WALLET } from '../DBTableNames';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Helpers } from '../../common/utils/helper-utils';

const seedUp = async () => {
  const logger = new Logger('Seeder');

  try {
    console.log('🚀 Seeder starting...');

    // 1. Check DB connection
    await dbConn.getConnection();
    console.log('✅ Database connection successful');

    // 2. Load mock data
    const admin = await Helpers.fetchMockfile(
      'src/database/seeder/data',
      'admin',
    );

    const platformWallet = await Helpers.fetchMockfile(
      'src/database/seeder/data',
      'platform-wallet',
    );

    console.log(`📦 Loaded ${admin.length} admin record(s) from file`);
    console.log(
      `📦 Loaded ${platformWallet.length} platform wallet record(s) from file`,
    );

    if (!admin.length) {
      console.log('⚠️ No data found in seed file. Exiting...');
      process.exit(0);
    }

    // 3. Clear table
    await dbConn.query(`SET FOREIGN_KEY_CHECKS = 0`);
    await dbConn.query(`TRUNCATE TABLE ${ADMIN}`);
    await dbConn.query(`TRUNCATE TABLE ${WALLET}`);

    // 👇 re-enable foreign key checks after
    await dbConn.query(`SET FOREIGN_KEY_CHECKS = 1`);
    console.log(`🧹 Tables truncated successfully`);

    // 4. Insert data
    for (const datum of admin) {
      const hashedPassword = await bcrypt.hash(datum.password, 10);

      await dbConn.query(
        `INSERT INTO ${ADMIN} 
        (full_name, phone, email, password, is_active, roles, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datum.full_name,
          datum.phone,
          datum.email,
          hashedPassword,
          datum.is_active,
          datum.roles,
          datum.created_at,
          datum.updated_at,
        ],
      );

      console.log(`✅ Inserted admin: ${datum.email}`);
    }

    for (const datum of platformWallet) {
      await dbConn.query(
        `INSERT INTO ${WALLET} (type, balance) VALUES (?, ?)`,
        [datum.type, datum.balance],
      );

      console.log(`✅ Inserted platform wallet: ${datum.type}`);
    }

    console.log('🎉 Seeder completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    logger.error(error);

    process.exit(1);
  }
};

if (process.argv[2] === 'seed-up') {
  seedUp().then(() => console.log('🏁 Seeder process finished'));
}
