
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bands', function(t) {
    t.increments()
    t.varchar('state').notNullable()
    t.varchar('city')
    t.varchar('band').notNullable()
    t.varchar('url')
    t.varchar('fb')
    t.varchar('bandcamp')
    t.varchar('spotify')
    t.varchar('genre')
    t.integer('stars')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('bands')
};
