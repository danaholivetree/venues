
exports.up = function(knex, Promise) {
  return knex.schema.createTable('venues', function(t) {
    t.increments()
    t.string('state').defaultTo('').notNullable()
    t.string('city').defaultTo('')
    t.string('venue').defaultTo('').notNullable()
    t.string('url').defaultTo('')
    t.varchar('email').defaultTo('')
    t.integer('capacity')
    t.boolean('diy').defaultTo(false)
    t.integer('up').defaultTo(0)
    t.integer('down').defaultTo(0)
  
    // .notNullable().onDelete('CASCADE')
    t.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('venues')
};
