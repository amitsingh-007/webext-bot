# Contributing

To start the developement for the first time, execute `npm start` and follow the steps [here](https://probot.github.io/docs/development/#running-the-app-locally). This should generate a `.env` file containing sensitive information.

To simulate Github Webhooks on local/dev environment, please look at [this](https://probot.github.io/docs/simulating-webhooks/).

1. Visit [Bot Settings Page -> Advanced](https://github.com/settings/apps/webext-bot/advanced).

2. To simulate `workflow_run.completed`, copy the payload and paste it in the file at the path `test\fixtures\workflow_run.completed.json`.

3. Now debug the app or press `F5`.
