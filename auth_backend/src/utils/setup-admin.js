const bcrypt = require('bcrypt');
const prisma = require('../config/database');

/**
 * Setup Admin User
 * Creates or updates admin user based on environment variables
 */
async function setupAdminUser() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    if (!adminEmail || !adminPassword) {
      console.log('⚠️  Admin credentials not found in .env - skipping admin setup');
      return;
    }

    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    const passwordHash = await bcrypt.hash(
      adminPassword,
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );

    if (adminUser) {
      // Update existing user to admin
      adminUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          passwordHash,
          fullName: adminName,
          accountStatus: 'ACTIVE',
          paymentStatus: 'COMPLETED',
          emailVerified: true
        }
      });
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          fullName: adminName,
          passwordHash,
          role: 'ADMIN',
          registrationMethod: 'admin_setup',
          accountStatus: 'ACTIVE',
          paymentStatus: 'COMPLETED',
          emailVerified: true,
          phoneVerified: false
        }
      });
      console.log('✅ Admin user created successfully');
    }

    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║           ADMIN CREDENTIALS                   ║
  ╠═══════════════════════════════════════════════╣
  ║  Email:    ${adminEmail.padEnd(30)}║
  ║  Password: ${adminPassword.padEnd(30)}║
  ║  Role:     ADMIN                              ║
  ╚═══════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error('❌ Failed to setup admin user:', error.message);
  }
}

module.exports = { setupAdminUser };
