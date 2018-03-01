
exports.up = function(knex, Promise) {
    return knex.schema.createTable('venue_votes', function(t) {
      t.increments()
      t.integer('user_id').references('users.id').notNullable().onDelete('CASCADE')
      t.integer('venue_id').references('venues.id').notNullable().onDelete('CASCADE')
      t.string('vote').notNullable()
    })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('venue_votes')
};
