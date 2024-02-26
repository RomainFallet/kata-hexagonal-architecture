type UserRegistrationForm = {
  name: string
  email: string
  password: string
  age: number
}

type User = {
  id: string
  name: string
  email: string
  password: string
  age: number
}

type UserFactory = (userRegistrationForm: UserRegistrationForm) => Promise<User>

export type { User, UserFactory, UserRegistrationForm }
