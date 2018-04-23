
exports.up = function(knex, Promise) {
  return knex.schema.table('users', t => {
      t.boolean('logged_in').defaultTo(true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', t => {
    t.dropColumn('logged_in');
  });
};
