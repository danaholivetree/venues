//
// exports.up = function(knex, Promise) {
// console.log('should not be running this migration')
//   return knex.schema.table('venues', t => {
//     t.integer('contributed_by').references('id').inTable('users');
//   })
// };
//
// exports.down = function(knex, Promise) {
//   return knex.schema.table('venues', function(t) {
//           t.dropColumn('contributed_by');
//       });
// };
