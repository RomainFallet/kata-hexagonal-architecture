import {
  type User,
  type UserFactory,
  type UserRegistrationForm
} from '../../model/user/index.js'
import { type SaveUser, SaveUserErrors } from '../../users-repository.js'

enum RegisterUserErrors {
  userIsTooYoung,
  userAlreadyExists
}

type RegisterUser = (
  userRegistrationForm: UserRegistrationForm
) => Promise<RegisterUserErrors | Pick<User, 'id'>>

const registerUser =
  (userFactory: UserFactory, saveUser: SaveUser): RegisterUser =>
  async (userRegistrationForm) => {
    if (userRegistrationForm.age < 15) {
      return RegisterUserErrors.userIsTooYoung
    }
    const user: User = await userFactory(userRegistrationForm)
    const saveResult = await saveUser(user)
    if (saveResult === SaveUserErrors.emailAlreadyExists) {
      return RegisterUserErrors.userAlreadyExists
    }

    return { id: user.id }
  }

export { registerUser, RegisterUserErrors }
