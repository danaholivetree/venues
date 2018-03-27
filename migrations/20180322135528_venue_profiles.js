//
// exports.up = function(knex, Promise) {
// console.log('should not be running this migration')
//   return knex.schema.createTable('venue_profiles', function(t) {
//     t.increments()
//     t.integer('venue_id').references('venues.id').notNullable().onDelete('CASCADE')
//     t.string('genres_booked')
//     t.string('type')
//     t.string('crowd')
//     t.string('pay')
//     t.string('promo')
//     t.string('sound')
//     t.string('accessibility')
//     t.string('ages')
//   })
// };
//
// exports.down = function(knex, Promise) {
//   return knex.schema.dropTableIfExists('venue_profiles')
// };
