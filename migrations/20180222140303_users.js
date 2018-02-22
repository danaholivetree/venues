
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(t) {
      t.increments()
      t.string('name').notNullable().defaultTo('anon')
      t.varchar('email', 128).notNullable()
      t.integer('contributions').defaultTo(0)
      t.boolean('admin').defaultTo(false)
    })
}

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users')
}
