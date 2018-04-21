
exports.up = function(knex, Promise) {
  return knex.schema.table('venue_profiles', t => {
    t.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('venue_profiles', t => {
    t.dropTimestamps();
  });
};
