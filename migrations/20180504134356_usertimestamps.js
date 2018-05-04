exports.up = function(knex, Promise) {
  return knex.schema.table('users', t => {
      t.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', t => {
    t.dropTimestamps();
  });
};
