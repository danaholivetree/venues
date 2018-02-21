module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/venues'
  }
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
}
