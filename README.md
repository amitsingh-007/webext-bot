# webext-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that An open-source Github Bot to report extension size change and extension version change on pull requests.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Docker

```sh
# 1. Build container
docker build -t webext-bot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> webext-bot
```

## Contributing

If you have suggestions for how webext-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2021 Amit Singh <amitsingh5198@gmail.com>
