export type UserInput = {
  age: number
  name: string
  email: string
  password: string
}

export class User {
  public readonly age: number
  public readonly email: string
  public readonly name: string
  constructor({ age, name, email }: UserInput) {
    if (age < 15) {
      throw new Error('user underaged')
    }
    if (name.length > 100) {
      throw new Error('user name length > 100')
    }
    if (name.length === 0) {
      throw new Error('user name length < 1')
    }
    if (!/^[\d._a-z-]{1,60}@[\d.a-z-]{1,39}$/.test(email)) {
      throw new Error('email invalide')
    }
    this.email = email
    this.age = age
    this.name = name
  }
}
