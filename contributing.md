# Contributing

To start development for the first time, execute `pnpm start` and follow the steps [here](https://probot.github.io/docs/development/#running-the-app-locally). This should generate a `.env` file containing sensitive information.

## Setup

```sh
# Install dependencies
pnpm install

# Login to vercel
pnpm vercel:link

# Pull vercel env variables
pnpm vercel:env

# Run the bot
pnpm start

# Run the tests
pnpm test

# Deploy a preview (production deploys happen automatically on push to `main`)
pnpm vercel:preview
```

## Tests

`test/integration` drives each webhook event through the real app with the GitHub API
mocked by nock, using the minimal hand-written payloads in `test/fixtures/payloads.ts`.
This is the fastest way to cover handler logic, so prefer adding a case there.

## Simulating real webhooks

The integration tests only carry the payload fields the handlers already read, so they
can't catch payload-shape drift, auth/permission problems, or how a comment actually
renders. For that, replay a real delivery ([probot docs](https://probot.github.io/docs/simulating-webhooks/)):

1. Visit [Bot Settings Page -> Advanced](https://github.com/settings/apps/webext-bot/advanced).

2. To simulate `workflow_run.completed`, copy the payload and paste it in the file at the path `test/fixtures/workflow_run.completed.json`.
   These payloads are gitignored on purpose — see the `.example` files for the paths each
   event expects.

3. Now debug the app or press `F5`, or run `pnpm simulate:workflow_run.completed`.
