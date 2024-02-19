import bodyParser from 'body-parser'
import express, {
  type NextFunction,
  type Request,
  type Response
} from 'express'
import { ValidationError, Validator } from 'express-json-validator-middleware'
import { type JSONSchema7 } from 'json-schema'
import pg from 'pg'

type User = {
  name: string
  email: string
  password: string
  age: number
}

const validator = new Validator({ strict: true })
const userSchema: JSONSchema7 = {
  type: 'object',
  required: ['name', 'email', 'password', 'age'],
  properties: {
    name: {
      type: 'string',
      maxLength: 100
    },
    email: {
      type: 'string',
      pattern: '^[a-z0-9-_.]{1,60}@[a-z0-9-.]{1,39}$'
    },
    password: {
      type: 'string',
      minLength: 20,
      maxLength: 100
    },
    age: {
      type: 'number'
    }
  }
}

const databasePool = new pg.Pool({
  host: process.env.HEXAGONAL_ARCHITECTURE_DB_HOSTNAME,
  user: process.env.HEXAGONAL_ARCHITECTURE_DB_USER,
  password: process.env.HEXAGONAL_ARCHITECTURE_DB_PASSWORD,
  database: process.env.HEXAGONAL_ARCHITECTURE_DB_NAME
})

const httpServerPort = process.env.HEXAGONAL_ARCHITECTURE_PORT

const applicationInstance = express()

const usersRouter = express.Router()
usersRouter.post(
  '/users',
  bodyParser.json(),
  validator.validate({ body: userSchema }),
  async (request: Request<unknown, unknown, User>, response: Response) => {
    const user = request.body

    if (user.age < 15) {
      response
        .status(400)
        .send({ error: 'User must be older than 15 years old' })
      return
    }

    try {
      const insertResult = await databasePool.query<{ id: string }>(
        'INSERT INTO user_account(name, email, password, age) VALUES($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING id;',
        [user.name, user.email, user.password, user.age]
      )

      if (insertResult.rows[0] === undefined) {
        response
          .status(400)
          .send({ error: 'An user with this email address already exists' })
        return
      }

      response.status(200).send(insertResult.rows[0])
    } catch (error: unknown) {
      console.error(error)
      response.status(500).send()
    }
  },
  (
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (error instanceof ValidationError) {
      response.status(400).send(error.validationErrors)
      next()
    } else {
      next(error)
    }
  }
)

applicationInstance.use(usersRouter)

applicationInstance.listen(httpServerPort, () => {
  console.log(`Application running on port ${httpServerPort}!`)
})

export { type User }
