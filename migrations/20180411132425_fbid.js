
exports.up = function(knex, Promise) {
  return knex.schema.table('users', t => {
    t.varchar('fbid', 255)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(t) {
    t.dropColumn('fbid');
  });
};
