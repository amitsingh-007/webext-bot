# webext-bot ![bypass_link_on_32](https://user-images.githubusercontent.com/51703039/212473396-a165495a-2c0e-41b1-abec-5079e46e4a67.png)

> A GitHub App built with [Probot](https://github.com/probot/probot) which is an open-source Github Bot to report extension size change and extension version change on pull requests.

## How to use

- Create a `webext.yml` inside `.github` directory. Following are the supported field in the config:

  ```yml
  manifest:
    <!-- Required: name of the web extension manifest file -->
    name: manifest.json
    <!-- Required: directory of the manifest file -->
    dir: './'

  workflow:
    <!-- Required: name of the GitHub workflow which generates the extension asset -->
    name: Build CI
    <!-- Required: name by which asset which is uploaded in the workflow -->
    artifact: extension-file

  <!-- Optional: these branches wont be processed. Takes an array of glob patterns -->
  branches-ignore:
    - dependabot/**

  <!-- Optional: minimum size change to allow a comment on the pull request -->
  comment-threshold: 512

  <!-- Optional: auto assign the list of users on opening every new PR and issue -->
  auto-assign:
    - xyz-github-username
  ```

- There must be a Github Workflow which creates the web extension as an asset during the run. This bot uses that file to process further.

- Currently, only Github Workflows are supported.

## Contributing

If you have suggestions for how webext-bot could be improved, or want to report a bug, open an issue!

Please check [CONTIBUTING.md](https://github.com/amitsingh-007/webext-bot/blob/main/CONTRIBUTING.md) to get started.

## License

[ISC](LICENSE) © 2021 Amit Singh <amitsingh5198@gmail.com>
