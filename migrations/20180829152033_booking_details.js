exports.up = function(knex, Promise) {
  return knex.schema.table('venue_profiles', t => {
      t.string('booking_details')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('venue_profiles', t => {
    t.dropColumn('booking_details');
  });
};
