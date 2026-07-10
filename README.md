### Hexlet tests and linter status:
[![Actions Status](https://github.com/dven-dev/fastify-web-development-project-6/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dven-dev/fastify-web-development-project-6/actions)
[![Node CI](https://github.com/dven-dev/fastify-web-development-project-6/actions/workflows/nodejs.yml/badge.svg)](https://github.com/dven-dev/fastify-web-development-project-6/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=dven-dev_fastify-web-development-project-6&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=dven-dev_fastify-web-development-project-6)

# Task Manager

A task management web app: create tasks, assign an executor, set a status and labels, and filter the task list by any of these.

**Live demo:** https://fastify-web-development-project-6-kj4j.onrender.com

## Features

- User registration and authentication
- Full CRUD for tasks, statuses, and labels
- Many-to-many task/label relations
- Task filtering by status, executor, label, and "my tasks only"
- Error tracking via Rollbar
- Runs on SQLite locally, PostgreSQL in production

## Tech stack

Node.js · Fastify · Objection.js · Knex · Pug · Bootstrap · i18next · Rollbar

## Getting started

Requires Node.js >= 20.19.0.

```bash
make setup
```

This installs dependencies, creates a `.env` file from `.env.example`, and runs migrations.

Fill in `.env` before starting the app:

```
SESSION_KEY=<any random string>
ROLLBAR_ACCESS_TOKEN=<your Rollbar token>
ROLLBAR_ENVIRONMENT=development
```

Start the app in development mode (rebuilds the frontend on change):

```bash
make start
```

## Scripts

| Command       | Description                     |
|---------------|----------------------------------|
| `make lint`   | Run the linter                  |
| `make test`   | Run the test suite              |
| `make build`  | Build the frontend assets       |
