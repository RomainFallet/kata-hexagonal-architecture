import { type User } from './model/user/index.js'

enum SaveUserErrors {
  emailAlreadyExists
}

type SaveUser = (user: User) => Promise<SaveUserErrors | 'saved'>

export { type SaveUser, SaveUserErrors }
