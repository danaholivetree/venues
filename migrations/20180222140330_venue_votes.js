
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venue_votes', function(t) {
      t.increments()
      t.integer('users_id').references('users.id').notNullable().onDelete('CASCADE')
      t.integer('venues_id').references('venues.id').notNullable().onDelete('CASCADE')
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('venue_votes')
};
