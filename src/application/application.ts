import bodyParser from 'body-parser'
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response
} from 'express'
import { ValidationError, Validator } from 'express-json-validator-middleware'
import { type JSONSchema7 } from 'json-schema'
import { type Pool } from 'pg'

type User = {
  name: string
  email: string
  password: string
}

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

const application = (databasePool: Pool): Express => {
  const applicationInstance = express()

  applicationInstance.post(
    '/users',
    bodyParser.json(),
    validator.validate({ body: userSchema }),
    async (request: Request<unknown, unknown, User>, response: Response) => {
      const user = request.body

      try {
        const insertResult = await databasePool.query(
          'INSERT INTO user_account(name, email, password) VALUES($1, $2, $3) ON CONFLICT DO NOTHING;',
          [user.name, user.email, user.password]
        )

        if (insertResult.rowCount === 0) {
          response
            .status(400)
            .send({ error: 'An user with this email address already exists' })
          return
        }

        response.status(201).send()
      } catch {
        response.status(500).send({})
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

  return applicationInstance
}

export { application, type User }
