import pg from 'pg'

import { application } from './application.js'

const databasePool = new pg.Pool({
  host: process.env.HEXAGONAL_ARCHITECTURE_DB_HOSTNAME,
  user: process.env.HEXAGONAL_ARCHITECTURE_DB_USER,
  password: process.env.HEXAGONAL_ARCHITECTURE_DB_PASSWORD,
  database: process.env.HEXAGONAL_ARCHITECTURE_DB_NAME
})

const httpServerPort = process.env.HEXAGONAL_ARCHITECTURE_PORT

const applicationInstance = application(databasePool)

applicationInstance.listen(httpServerPort, () => {
  console.log(`Application running on port ${httpServerPort}!`)
})
