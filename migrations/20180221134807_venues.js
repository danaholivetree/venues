
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
    t.boolean('diy').notNullable().defaultTo(false)
    t.integer('up').notNullable().defaultTo(0)
    t.integer('down').notNullable().defaultTo(0)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('venues')
};
