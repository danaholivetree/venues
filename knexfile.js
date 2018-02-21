module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/venues_and_bands'
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
}
