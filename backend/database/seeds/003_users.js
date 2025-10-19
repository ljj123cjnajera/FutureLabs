const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Hashes de contraseñas
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);
  const moderatorPassword = await bcrypt.hash('moderator123', 10);
  
  // Inserts seed entries
  await knex('users').insert([
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      email: 'admin@futurelabs.com',
      password_hash: adminPassword,
      first_name: 'Admin',
      last_name: 'FutureLabs',
      phone: '+51 999 999 999',
      role: 'admin',
      email_verified: true,
      email_verified_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      email: 'customer@example.com',
      password_hash: customerPassword,
      first_name: 'Juan',
      last_name: 'Pérez',
      phone: '+51 987 654 321',
      role: 'client',
      email_verified: true,
      email_verified_at: new Date()
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440003',
      email: 'moderator@futurelabs.com',
      password_hash: moderatorPassword,
      first_name: 'María',
      last_name: 'González',
      phone: '+51 987 654 322',
      role: 'moderator',
      email_verified: true,
      email_verified_at: new Date()
    }
  ]);
};
