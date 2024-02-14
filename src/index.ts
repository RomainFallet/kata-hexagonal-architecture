import bodyParser from 'body-parser'
import express, {
  type NextFunction,
  type Request,
  type Response
} from 'express'
import { Validator, ValidationError } from 'express-json-validator-middleware'
import { type JSONSchema7 } from 'json-schema'
import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.HEXAGONAL_ARCHITECTURE_DB_HOSTNAME,
  user: process.env.HEXAGONAL_ARCHITECTURE_DB_USER,
  password: process.env.HEXAGONAL_ARCHITECTURE_DB_PASSWORD,
  database: process.env.HEXAGONAL_ARCHITECTURE_DB_NAME
})

const validator = new Validator({ strict: true })
const userSchema: JSONSchema7 = {
  type: 'object',
  required: ['name', 'email', 'password'],
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
    }
  }
}

type User = {
  name: string
  email: string
  password: string
}

const app = express()

app.use(bodyParser.json())

app.post(
  '/users',
  validator.validate({ body: userSchema }),
  async (request: Request<unknown, unknown, User>, response: Response) => {
    const user = request.body

    try {
      const existingUsers = (
        await pool.query<User>(
          'SELECT name, email, password FROM user_account WHERE email = $1;',
          [user.email]
        )
      ).rows

      if (existingUsers[0] !== undefined) {
        response
          .status(400)
          .send({ error: 'An user with this email address already exists' })
        return
      }

      await pool.query(
        'INSERT INTO user_account(name, email, password) VALUES($1, $2, $3);',
        [user.name, user.email, user.password]
      )
      response.status(201).send()
    } catch (error: unknown) {
      response.status(500).send({})
    }
  }
)

app.use(
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

const port = process.env.HEXAGONAL_ARCHITECTURE_PORT
app.listen(port, () => {
  console.log(`Application running on port ${port}!`)
})
