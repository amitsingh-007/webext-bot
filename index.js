const bytes = require("bytes");
const semver = require("semver");
const getCurrentArtifactSize = require("./utils/getCurrentArtifactSize");
const getLatestReleaseExtensionSize = require("./utils/getLatestReleaseExtensionSize");
const commentOnPullRequest = require("./utils/commentOnPullRequest");
const commentOnPullRequests = require("./utils/commentOnPullRequests");
const createCheckRun = require("./utils/createCheckRun");
const updateCheck = require("./utils/updateCheck");
const { getEmoji, getMessage } = require("./utils");
const getContent = require("./utils/getContent");
const isValidVersion = require("./utils/isValidVersion");
const { manifestFilePath, CHECK_NAME } = require("./constants");

/**
 * @param {import('probot').Probot} app
 */
const app = (app) => {
  app.log.info("App started.");

  app.on("workflow_run.completed", async (context) => {
    try {
      const { workflow, workflow_run } = context.payload;
      if (workflow.name !== "CI") {
        return;
      }
      const { head_commit } = workflow_run;
      const check = await createCheckRun({
        context,
        name: CHECK_NAME,
        commitId: head_commit.id,
        checkOutput: {
          title: "Check is in progress",
          message: "Waiting...",
          status: "in_progress",
        },
      });
      if (workflow_run.conclusion !== "success") {
        await updateCheck({
          context,
          check,
          checkOutput: {
            conclusion: "failure",
            title: "Build faild. Make your CI build succeeds.",
            message:
              "Your CI build failed. Please check and make sure it passes. If CI build passes then only this check is executed.",
          },
        });
        return;
      }
      const currentExtSize = await getCurrentArtifactSize(context);
      const latestReleaseExtSize = await getLatestReleaseExtensionSize(context);
      const sizeDiff = currentExtSize - latestReleaseExtSize;
      const message = getMessage(
        currentExtSize,
        latestReleaseExtSize,
        head_commit.id
      );
      await commentOnPullRequests(context, message);
      await updateCheck({
        context,
        check,
        checkOutput: {
          conclusion: "success",
          title: `Total size difference - ${bytes(sizeDiff)} ${getEmoji(
            sizeDiff
          )}`,
          message,
        },
      });
    } catch (error) {
      app.log.info(error);
    }
  });

  app.on("pull_request.synchronize", async (context) => {
    try {
      const { before, after, pull_request } = context.payload;
      const currentManifest = await getContent({
        context,
        path: manifestFilePath,
        ref: after,
      });
      const latestReleaseManifest = await getContent({
        context,
        path: manifestFilePath,
        ref: before,
      });
      const oldVersion = latestReleaseManifest.version;
      const newVersion = currentManifest.version;
      if (!isValidVersion(oldVersion, newVersion)) {
        await commentOnPullRequest(
          context,
          `
Please check the extension version in the manifest.
* New version can't be less than existing version.
* Check the version format.`,
          pull_request.number
        );
        return;
      }
      if (semver.gt(newVersion, oldVersion)) {
        await commentOnPullRequest(
          context,
          `Extension version is updated from \`${oldVersion}\` to \`${newVersion}\``,
          pull_request.number
        );
      }
    } catch (error) {
      context.log.info(error);
    }
  });
};

module.exports = app;
