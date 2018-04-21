
exports.up = function(knex, Promise) {
  return knex.schema.table('users', t => {
      t.boolean('authorized').defaultTo(true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', t => {
    t.dropColumn('authorized');
  });
};
