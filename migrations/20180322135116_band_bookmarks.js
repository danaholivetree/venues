
exports.up = function(knex, Promise) {
  return knex.schema.createTable('band_bookmarks', function(t) {
    t.increments()
    t.integer('user_id').references('users.id').notNullable().onDelete('CASCADE')
    t.integer('band_id').references('bands.id').notNullable().onDelete('CASCADE')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('band_bookmarks')
};
