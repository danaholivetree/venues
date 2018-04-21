
exports.up = function(knex, Promise) {
  return knex.schema.table('users', t => {
    t.dropColumn('hashed_pw');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', t => {
    t.varchar('hashed_pw');
  });
};
