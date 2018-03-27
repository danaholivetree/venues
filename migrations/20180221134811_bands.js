
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bands', function(t) {
    t.increments()
    t.string('state').defaultTo('').notNullable()
    t.string('city').defaultTo('').notNullable()
    t.string('band').defaultTo('').notNullable()
    t.string('url').defaultTo('')
    t.string('fb').defaultTo('')
    t.string('bandcamp').defaultTo('')
    t.string('spotify').defaultTo('')
    t.string('genre').defaultTo('')
    t.integer('stars').defaultTo(0)

    // .notNullable().onDelete('CASCADE')
    t.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('bands')
};
