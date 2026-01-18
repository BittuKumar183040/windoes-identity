exports.up = function (knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.string('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username', 100).unique().nullable();
      table.string('name', 100).notNullable();
      table.string('email', 100).notNullable().unique();
      table.string('passwordHash', 255).notNullable();
      table.string('pin', 10);
      table.string('status', 50).notNullable().defaultTo('ACTIVE');
      table.integer('createdAt').notNullable().defaultTo(knex.raw("EXTRACT(EPOCH FROM NOW())::INTEGER"));
      table.integer('updatedAt').notNullable().defaultTo(knex.raw("EXTRACT(EPOCH FROM NOW())::INTEGER"));
    })
    .then(() => {
      return knex.schema.createTable('files', (table) => {
        table.string('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('userId').notNullable();
        table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
        table.string('fileTag', 50).notNullable();
        table.string('filename', 255).notNullable();
        table.string('status', 50).notNullable().defaultTo('ACTIVE');
        table.integer('createdAt').notNullable().defaultTo(knex.raw("EXTRACT(EPOCH FROM NOW())::INTEGER"));
        table.integer('updatedAt').notNullable().defaultTo(knex.raw("EXTRACT(EPOCH FROM NOW())::INTEGER"));
      });
    })
    .then(() => {
      return knex('users').insert({
        id: 'admin',
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@system.com',
        passwordHash: '$2b$10$av.VnHybuvoIOWv4c64VGuiShR28Ih3FqEtgfqKj522EUdZwvuzam', // SecurePass123!
        status: 'ACTIVE',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('files')
    .then(() => knex.schema.dropTableIfExists('users'));
};
