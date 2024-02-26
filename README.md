# Kata Hexagonal Architecture

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [E2E tests](#e2e-tests)
- [Usage](#usage)
- [Getting started](#getting-started)
  - [Mission 1](#mission-1)

## Prerequisites

Follow [these instructions](./PREREQUISITES.md) to set up your environment.

## Installation

[Back to top ↑](#kata-hexagonal-architecture)

Clone this repository and install its dependencies with:

```bash
npm ci
```

Then, create a `./.env` file containing:

```txt
HEXAGONAL_ARCHITECTURE_PORT=3000
HEXAGONAL_ARCHITECTURE_DB_HOSTNAME=localhost
HEXAGONAL_ARCHITECTURE_DB_USER=hexagonal_architecture_user
HEXAGONAL_ARCHITECTURE_DB_PASSWORD=hexagonal_architecture_password
HEXAGONAL_ARCHITECTURE_DB_NAME=hexagonal_architecture_db
```

Finally, execute database migrations:

```bash
npm run db-migrate:up
```
## E2E tests

[Back to top ↑](#kata-hexagonal-architecture)

To execute end to end tests, create a `./.env.e2e` file containing:

```txt
ADMIN_DB_HOSTNAME=localhost
ADMIN_DB_USER=postgres
ADMIN_DB_PASSWORD=postgres
ADMIN_DB_NAME=postgres
```

Then run:

```bash
npm run test:e2e
```

## Usage

[Back to top ↑](#kata-hexagonal-architecture)

**Build project:**

```bash
npm run build
```

**Lint files:**

```bash
npm run lint
```

**Start application:**

```bash
npm start
```

**Execute unit tests:**

```bash
npm test
```

## Getting started

[Back to top ↑](#kata-hexagonal-architecture)

This application is strongly coupled: presentation, business logic and storage
layers all live in the same file without any separation of concerns.

### Mission 1

Your first mission is to extract a domain layer in `./domains/users-management` using the principles of hexagonal architecture.

