# webext-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) which is an open-source Github Bot to report extension size change and extension version change on pull requests.

## How to use

- Create a `.webextrc.json` in the root of the project. Following are the supported field in the config with their default values:

  ```json
  {
    "manifest": {
      //name of the web extension manifest file
      "name": "manifest.json",
      //directory of the manifest file
      "dir": "./"
    },
    "workflow": {
      //name of the GH workflow which generates the extension asset
      "name": "Extension CI",
      //name by which asset is uploaded
      "artifact": "extension"
    },
    //these branches wont be processed. Takes array of glob patterns. Eg. ["dependabot/**"]
    "branchesIgnore": [""],
    //minimum size change to allow a comment on the pull request
    "commentThreshold": 0
  }
  ```

- There must be a Github Workflow which creates the web extension as an asset during the run. This bot uses that file to process further.

- Currently, only Github Workflows are supported.

## Contributing

If you have suggestions for how webext-bot could be improved, or want to report a bug, open an issue!

Please check [CONTIBUTING.md](https://github.com/amitsingh-007/webext-bot/blob/main/CONTRIBUTING.md) to get started.

## License

[ISC](LICENSE) © 2021 Amit Singh <amitsingh5198@gmail.com>
