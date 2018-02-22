
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bands', function(t) {
    t.increments()
    t.string('state').defaultTo('')
    t.string('city').defaultTo('')
    t.string('band').defaultTo('')
    t.string('url').defaultTo('')
    t.string('fb').defaultTo('')
    t.string('bandcamp').defaultTo('')
    t.string('spotify').defaultTo('')
    t.string('genre').defaultTo('')
    t.integer('stars').defaultTo(0)
    t.timestamps(true, true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('bands')
};
