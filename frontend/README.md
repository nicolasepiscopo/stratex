

<p align="center">
  <img src="../docs/logo_transp_bg.png" alt="StratEx" style="width: 500px">
</p>

# StratEx Frontend

Repository for StratEx frontend application.

## Tech Stack and libraries

- TypeScript
- NextJS
- React Query
- Solidity
- Ethersjs

## Local Setup

Clone the repository in your machine.

Copy `.env.example` into `.env` and fill it out with your configuration.

Then to run the project:

```bash
# with yarn
cd /{REPO_PATH}/frontend
yarn
yarn dev

# with npm
cd /{REPO_PATH}/frontend
npm install
npm run dev
```

## Production environment

As of now production environment is a deployment of latest `main` branch. 

⚠️ ***It is limited to the usage of a single Bot.***

https://main--wonderful-stroopwafel-b179a1.netlify.app/

## Development environment

As of now development environment is a deployment of `multipleBots1User` branch.

https://deploy-preview-7--wonderful-stroopwafel-b179a1.netlify.app/

This version comes with the support of some new beta features like:

- Multiple users.
- Multiple bots per user.
- Pause / Resume Bots.
- Watch tx event log for single Bot.
- Withdraw balances from Bots.
- Delete a Bot.
