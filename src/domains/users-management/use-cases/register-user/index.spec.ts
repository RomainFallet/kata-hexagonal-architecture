import { faker } from '@faker-js/faker'
import { deepStrictEqual } from 'node:assert'
import { randomUUID } from 'node:crypto'
import { describe, it, mock } from 'node:test'

import { type SaveUser, SaveUserErrors } from '../../users-repository.js'
import {
  type User,
  type UserFactory,
  type UserRegistrationForm
} from '../../model/user/index.js'

import { registerUser, RegisterUserErrors } from './index.js'

describe('registerUser', () => {
  it('should return an error if user is too young', async () => {
    // Arrange
    const userRegistrationFormMock: UserRegistrationForm = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 30 }),
      age: 10
    }
    const dummyUserFactory: UserFactory = mock.fn()
    const dummySaveUser: SaveUser = mock.fn()
    const registerUserTest = registerUser(dummyUserFactory, dummySaveUser)

    // Act
    const result = await registerUserTest(userRegistrationFormMock)

    // Assert
    deepStrictEqual(result, RegisterUserErrors.userIsTooYoung)
  })

  it('should return an error if email already exists', async () => {
    // Arrange
    const userRegistrationFormMock: UserRegistrationForm = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 30 }),
      age: 20
    }
    const userMock: User = {
      ...userRegistrationFormMock,
      id: randomUUID()
    }
    const userFactoryStub: UserFactory = () => {
      return Promise.resolve(userMock)
    }
    const saveUserStub: SaveUser = () => {
      return Promise.resolve(SaveUserErrors.emailAlreadyExists)
    }
    const registerUserTest = registerUser(userFactoryStub, saveUserStub)

    // Act
    const result = await registerUserTest(userRegistrationFormMock)

    // Assert
    deepStrictEqual(result, RegisterUserErrors.userAlreadyExists)
  })

  it('should return an error if email already exists', async () => {
    // Arrange
    const userRegistrationFormMock: UserRegistrationForm = {
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 30 }),
      age: 20
    }
    const userMock: User = {
      ...userRegistrationFormMock,
      id: randomUUID()
    }
    const userFactoryStub: UserFactory = () => {
      return Promise.resolve(userMock)
    }
    const saveUserStub: SaveUser = () => {
      return Promise.resolve('saved')
    }
    const registerUserTest = registerUser(userFactoryStub, saveUserStub)

    // Act
    const result = await registerUserTest(userRegistrationFormMock)

    // Assert
    deepStrictEqual(result, { id: userMock.id })
  })
})
