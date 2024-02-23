// @ts-expect-error 'This library is not typed'
import dbMigrate from 'db-migrate'
import { type Express } from 'express'
import { randomUUID } from 'node:crypto'
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse
} from 'node:http'
import pg, { type Pool } from 'pg'

type TestDatabaseCredentials = Readonly<{
  databaseName: string
  databaseUser: string
  databasePassword: string
}>

type TestDatabase = Readonly<{
  pool: Pool
  credentials: TestDatabaseCredentials
}>

type HttpServer = Server<typeof IncomingMessage, typeof ServerResponse>

type TestApplication = {
  readonly httpServer: HttpServer
  readonly httpPort: number
}

type TestEnvironment = {
  readonly database: TestDatabase
  readonly application: TestApplication
  readonly administratorDatabasePool: Pool
}

type TestUser = {
  name: string
  email: string
  password: string
  age: number
}

const generateTestDatabaseCredentials = (): TestDatabaseCredentials => {
  const testUuid = randomUUID()
  const databaseName = `db_${testUuid}`
  const databaseUser = `user_${testUuid}`
  const databasePassword = `password_${testUuid}`

  return {
    databaseName,
    databaseUser,
    databasePassword
  }
}

const createTestDatabase = async (
  adminDatabasePool: Pool
): Promise<TestDatabase> => {
  const { databaseUser, databaseName, databasePassword } =
    generateTestDatabaseCredentials()

  await adminDatabasePool.query(
    `CREATE ROLE "${databaseUser}" WITH LOGIN PASSWORD '${databasePassword}';`
  )
  await adminDatabasePool.query(
    `CREATE DATABASE "${databaseName}" ENCODING UTF8;`
  )
  await adminDatabasePool.query(
    `ALTER DATABASE "${databaseName}" OWNER TO "${databaseUser}";`
  )
  await adminDatabasePool.query(
    `GRANT ALL PRIVILEGES ON DATABASE "${databaseName}" to "${databaseUser}";`
  )

  const testDatabasePool = new pg.Pool({
    host: process.env.ADMIN_DB_HOSTNAME,
    user: databaseUser,
    password: databasePassword,
    database: databaseName
  })

  const databaseMigrateInstance = dbMigrate.getInstance(true, {
    config: {
      defaultEnv: 'e2e',
      e2e: {
        driver: 'pg',
        user: databaseUser,
        password: databasePassword,
        host: process.env.ADMIN_DB_HOSTNAME,
        database: databaseName,
        port: '5432'
      }
    }
  })
  await databaseMigrateInstance.reset()
  await databaseMigrateInstance.up()

  return {
    pool: testDatabasePool,
    credentials: { databaseUser, databaseName, databasePassword }
  }
}

const cleanTestDatabase = async (
  adminDatabasePool: Pool,
  testDatabase: TestDatabase
): Promise<void> => {
  await testDatabase.pool.end()
  await adminDatabasePool.query(
    `DROP DATABASE IF EXISTS "${testDatabase.credentials.databaseName}";`
  )
  await adminDatabasePool.query(
    `DROP ROLE IF EXISTS "${testDatabase.credentials.databaseUser}";`
  )
}

const startApplication = async (
  applicationInstance: Express
): Promise<TestApplication> => {
  const httpPort = await getFreeHttpPort()
  const httpServer = applicationInstance.listen(httpPort)
  return { httpServer, httpPort }
}
const stopApplication = (httpServer: HttpServer): void => {
  httpServer.close()
}

const isHttpPortFree = async (port: number): Promise<boolean> => {
  return await new Promise((resolve, reject) => {
    const httpServer = createServer()
    httpServer.listen(port, '127.0.0.1', () => {
      httpServer.close()
      resolve(true)
    })
    httpServer.on('error', (error) => {
      if ('code' in error && error.code === 'EADDRINUSE') {
        httpServer.close()
        resolve(false)
        return
      }

      reject(error)
    })
  })
}

const getRandomNumberInRange = (
  startRange: number,
  endRange: number
): number => {
  return Math.floor(Math.random() * (endRange - startRange + 1)) + startRange
}

const getFreeHttpPortOnRange = async (
  startRange: number,
  endRange: number
): Promise<number> => {
  const port = getRandomNumberInRange(startRange, endRange)

  if (!(await isHttpPortFree(port))) {
    return await getFreeHttpPortOnRange(startRange, endRange)
  }

  return port
}

const getFreeHttpPort = (): Promise<number> => {
  return getFreeHttpPortOnRange(3000, 3999)
}

const setupTestEnvironment = async (
  application: (pool: Pool) => Express
): Promise<TestEnvironment> => {
  const administratorDatabasePool = new pg.Pool({
    host: process.env.ADMIN_DB_HOSTNAME,
    user: process.env.ADMIN_DB_USER,
    password: process.env.ADMIN_DB_PASSWORD,
    database: process.env.ADMIN_DB_NAME
  })
  const testDatabase = await createTestDatabase(administratorDatabasePool)
  const testApplication = await startApplication(application(testDatabase.pool))

  return {
    database: testDatabase,
    application: testApplication,
    administratorDatabasePool
  }
}

const cleanTestEnvironment = async (
  testEnvironment: TestEnvironment
): Promise<void> => {
  stopApplication(testEnvironment.application.httpServer)
  await cleanTestDatabase(
    testEnvironment.administratorDatabasePool,
    testEnvironment.database
  )
  await testEnvironment.administratorDatabasePool.end()
}

const getUsersFromDatabase = async (
  pool: Pool,
  email: string
): Promise<TestUser[]> => {
  const queryResult = await pool.query<TestUser>(
    'SELECT email, name, password, age FROM "user_account" WHERE email = $1;',
    [email]
  )
  return queryResult.rows
}

const getUserFromDatabase = async (
  pool: Pool,
  email: string
): Promise<TestUser | null> => {
  const queryResult = await pool.query<TestUser>(
    'SELECT email, name, password, age FROM "user_account" WHERE email = $1;',
    [email]
  )
  return queryResult.rows[0] ?? null
}

const saveUserInDatabase = async (
  pool: Pool,
  user: TestUser
): Promise<void> => {
  await pool.query<TestUser>(
    'INSERT INTO user_account(email, name, password, age) VALUES($1, $2, $3, $4);',
    [user.email, user.name, user.password, user.age]
  )
}

type JsonContent = readonly unknown[] | Record<string, unknown>

const parseJsonContent = (jsonContent: string): JsonContent => {
  const parsedJsonContent = JSON.parse(jsonContent)

  if (Array.isArray(parsedJsonContent)) {
    return parsedJsonContent as readonly unknown[]
  }

  return parsedJsonContent as Record<string, unknown>
}

const hasKey = (object: JsonContent, key: string): boolean => {
  return Object.keys(object).includes(key)
}

type TestHttpClient = {
  postJson: (urlPath: string, jsonContent: JsonContent) => Promise<Response>
}

const testHttpClient = (baseUrl: string): TestHttpClient => {
  return {
    postJson: (urlPath: string, jsonContent: JsonContent) => {
      return fetch(`${baseUrl}${urlPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonContent)
      })
    }
  }
}

export {
  cleanTestEnvironment,
  getUserFromDatabase,
  getUsersFromDatabase,
  hasKey,
  parseJsonContent,
  saveUserInDatabase,
  setupTestEnvironment,
  type TestDatabase,
  type TestDatabaseCredentials,
  testHttpClient
}
