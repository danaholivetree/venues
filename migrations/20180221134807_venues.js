
exports.up = function(knex, Promise) {
  return knex.schema.createTable('venues', function(t) {
    t.increments()
    t.varchar('state').notNullable()
    t.varchar('city')
    t.varchar('venue').notNullable()
    t.varchar('url')
    t.varchar('fb')
    t.varchar('email')
    t.integer('capacity')
    t.boolean('diy').defaultTo(false)
    t.integer('up').defaultTo(0)
    t.integer('down').defaultTo(0)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('venues')
};
