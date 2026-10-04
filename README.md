# Papa’s Love Children Ministry API
NestJS + GraphQL + Prisma + PostgreSQL backend for the ministry admin portal.

## Railway variables
- DATABASE_URL: Railway PostgreSQL connection string (use the database service's private URL/reference if API and DB are in the same Railway project)
- JWT_SECRET: cryptographically random secret, at least 32 characters
- ADMIN_EMAIL: the one fixed administrator login email
- ADMIN_PASSWORD_HASH: bcrypt hash for the fixed administrator password
- FRONTEND_ORIGIN: exact deployed frontend origin (no trailing slash); comma-separated origins are supported
- NODE_ENV=production
- PORT is supplied by Railway

Generate a bcrypt hash locally with Node: `node -e "require('bcrypt').hash('YOUR-STRONG-PASSWORD',12).then(console.log)"`. Never commit actual credentials. Admin identity is env-configured and cannot be changed through the API.

## Deploy
Build command: `npm install && npx prisma generate && npm run build`
Start command: `npx prisma migrate deploy && npm run start:prod`
GraphQL endpoint: `/api/graphql`.

Create and commit an initial migration before deploying: `npx prisma migrate dev --name init`. Do not use `prisma db push` as the production migration workflow.

## Security notes
Admin GraphQL operations require `Authorization: Bearer <accessToken>`; login token expires after 8 hours. Public form mutations are unauthenticated. Add rate limiting, CAPTCHA, email verification and request validation before high-traffic production use.
