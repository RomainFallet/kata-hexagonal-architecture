import { faker } from '@faker-js/faker'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'
import pg from 'pg'

import { application, type User } from '../application/application.js'

import {
  cleanTestEnvironment,
  getUserFromDatabase,
  setupTestEnvironment
} from './test-utilities.js'

const administratorDatabasePool = new pg.Pool({
  host: process.env.ADMIN_DB_HOSTNAME,
  user: process.env.ADMIN_DB_USER,
  password: process.env.ADMIN_DB_PASSWORD,
  database: process.env.ADMIN_DB_NAME
})

describe('POST /users', () => {
  it('should create a new user', async () => {
    const testEnvironment = await setupTestEnvironment(
      administratorDatabasePool,
      application
    )

    try {
      // Arrange
      const userMock: User = {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: faker.internet.password({ length: 30 }),
        age: 20
      }

      // Act
      const response = await fetch(
        `http://127.0.0.1:${testEnvironment.application.httpPort}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userMock)
        }
      )
      const responseBody = await response.text()

      // Assert
      const expectedUser = userMock
      const createdUser = await getUserFromDatabase(
        testEnvironment.database.pool,
        userMock.email
      )
      strictEqual(responseBody, '')
      strictEqual(response.status, 201)
      deepStrictEqual(createdUser, expectedUser)
    } finally {
      await cleanTestEnvironment(administratorDatabasePool, testEnvironment)
    }
  })
})
