
exports.up = function(knex, Promise) {
  return knex.schema.alterTable('venue_profiles', t => {
    t.text('genres_booked').alter()
    t.text('type').alter()
    t.text('crowd').alter()
    t.text('pay').alter()
    t.text('promo').alter()
    t.text('sound').alter()
    t.text('accessibility').alter()
    t.text('booking_details').alter()
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('venue_profiles', t => {
    t.string('genres_booked').alter()
    t.string('type').alter()
    t.string('crowd').alter()
    t.string('pay').alter()
    t.string('promo').alter()
    t.string('sound').alter()
    t.string('accessibility').alter()
    t.string('booking_details').alter()
  });
};
