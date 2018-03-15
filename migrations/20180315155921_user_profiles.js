
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_profiles', function(t) {
      t.increments()
      t.integer('user_id').notNullable()
      t.string('name').notNullable()
      t.string('bio')
      t.varchar('location').notNullable()
      t.varchar('previous_locations')
      t.varchar('current_bands')
      t.varchar('previous_bands')
      t.varchar('favorite_venue')
      t.string('fb_url')
      t.string('linkedin_url')
      t.string('instagram_handle')
    })
}

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('user_profiles')
}
