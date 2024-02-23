import { faker } from '@faker-js/faker'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'

import {
  application,
  type User
} from '../applications/express-users-management/application.js'

import {
  cleanTestEnvironment,
  getUserFromDatabase,
  getUsersFromDatabase,
  hasKey,
  parseJsonContent,
  saveUserInDatabase,
  setupTestEnvironment,
  testHttpClient
} from './test-utilities.js'

describe('POST /users', { concurrency: 10 }, () => {
  it('should create a new user', async () => {
    const testEnvironment = await setupTestEnvironment(application)

    try {
      // Arrange
      const userMock: User = {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: faker.internet.password({ length: 30 }),
        age: 20
      }
      const httpClient = testHttpClient(
        `http://127.0.0.1:${testEnvironment.application.httpPort}`
      )

      // Act
      const response = await httpClient.postJson('/users', userMock)
      const responseBody = parseJsonContent(await response.text())

      // Assert
      const createdUser = await getUserFromDatabase(
        testEnvironment.database.pool,
        userMock.email
      )
      strictEqual(hasKey(responseBody, 'id'), true)
      strictEqual(response.status, 200)
      deepStrictEqual(createdUser, userMock)
    } finally {
      await cleanTestEnvironment(testEnvironment)
    }
  })

  it('should return an error if user is too young', async () => {
    const testEnvironment = await setupTestEnvironment(application)

    try {
      // Arrange
      const userMock: User = {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: faker.internet.password({ length: 30 }),
        age: 10
      }
      const httpClient = testHttpClient(
        `http://127.0.0.1:${testEnvironment.application.httpPort}`
      )

      // Act
      const response = await httpClient.postJson('/users', userMock)
      const responseBody = parseJsonContent(await response.text())

      // Assert
      const createdUser = await getUserFromDatabase(
        testEnvironment.database.pool,
        userMock.email
      )
      deepStrictEqual(responseBody, {
        error: 'User must be older than 15 years old'
      })
      strictEqual(response.status, 400)
      deepStrictEqual(createdUser, null)
    } finally {
      await cleanTestEnvironment(testEnvironment)
    }
  })

  it('should return an error if user is already registered', async () => {
    const testEnvironment = await setupTestEnvironment(application)

    try {
      // Arrange
      const existingUserMock: User = {
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        password: faker.internet.password({ length: 30 }),
        age: 20
      }
      await saveUserInDatabase(testEnvironment.database.pool, existingUserMock)
      const userMock: User = {
        email: existingUserMock.email,
        name: faker.person.fullName(),
        password: faker.internet.password({ length: 30 }),
        age: 25
      }
      const httpClient = testHttpClient(
        `http://127.0.0.1:${testEnvironment.application.httpPort}`
      )

      // Act
      const response = await httpClient.postJson('/users', userMock)
      const responseBody = parseJsonContent(await response.text())

      // Assert
      const createdUsers = await getUsersFromDatabase(
        testEnvironment.database.pool,
        userMock.email
      )
      deepStrictEqual(responseBody, {
        error: 'An user with this email address already exists'
      })
      strictEqual(response.status, 400)
      deepStrictEqual(createdUsers, [existingUserMock])
    } finally {
      await cleanTestEnvironment(testEnvironment)
    }
  })
})
