import { deepStrictEqual, throws } from 'node:assert'
import { describe, test } from 'node:test'

import { User, type UserInput } from './user.js'

describe(`user`, () => {
  test('Un utilisateur ne peut pas avoir moins de 15 ans', () => {
    const userInput: UserInput = { age: 14, name: '', email: '', password: '' }
    throws(() => new User(userInput), new Error('user underaged'))
  })

  test('Un utilisateur a un nom', () => {
    const userInput: UserInput = {
      age: 16,
      name: 'seb le boss',
      email: 'seb@gmail.com',
      password: ''
    }
    const user = new User(userInput)
    deepStrictEqual(user.name, userInput.name)
  })

  test('Le nom ne peut pas dépasser 100 caractères', () => {
    const userInput: UserInput = {
      age: 16,
      name: Array.from({ length: 101 }).fill(' ').join(''),
      email: 'seb@gmail.com',
      password: ''
    }
    throws(() => new User(userInput), new Error('user name length > 100'))
  })

  test('Le nom doit contenir au moins 1 caractère', () => {
    const userInput: UserInput = {
      age: 16,
      name: '',
      email: 'seb@gmail.com',
      password: ''
    }
    throws(() => new User(userInput), new Error('user name length < 1'))
  })

  test("L'email doit être un email valide", () => {
    const userInput: UserInput = {
      age: 17,
      name: 'seb le boss',
      email: 'seb',
      password: ''
    }
    throws(() => new User(userInput), new Error('email invalide'))
  })

  test('')
})
