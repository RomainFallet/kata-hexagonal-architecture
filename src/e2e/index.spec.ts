// import { faker } from '@faker-js/faker'
// import { deepStrictEqual, strictEqual } from 'node:assert'
import { describe, it } from 'node:test'

// import {
//   cleanTestEnvironment,
//   getUserFromDatabase,
//   setupTestEnvironment
// } from './test-utilities.js'

describe('POST /users', () => {
  it('should create a new user', async () => {
    // const testEnvironment = await setupTestEnvironment(
    //   application
    // )

    try {
      // Arrange
      // const userMock: User = {
      //   email: faker.internet.email().toLowerCase(),
      //   name: faker.person.fullName(),
      //   password: faker.internet.password({ length: 30 }),
      //   age: 20
      // }
      // Act
      // const response = await fetch(
      //   `http://127.0.0.1:${testEnvironment.application.httpPort}/users`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(userMock)
      //   }
      // )
      // const responseBody = await response.text()
      // Assert
      // const expectedUser = userMock
      // const createdUser = await getUserFromDatabase(
      //   testEnvironment.database.pool,
      //   userMock.email
      // )
      // strictEqual(responseBody, '')
      // strictEqual(response.status, 200)
      // deepStrictEqual(createdUser, expectedUser)
    } finally {
      // await cleanTestEnvironment(testEnvironment)
    }
  })
})
