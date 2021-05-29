const getCurrentArtifactSize = require("./utils/getCurrentArtifactSize");
const getLatestReleaseExtensionSize = require("./utils/getLatestReleaseExtensionSize");
const commentOnPullRequest = require("./utils/commentOnPullRequest");
const createCheckRun = require("./utils/createCheckRun");
const updateCheck = require("./utils/updateCheck");
const { getMessage } = require("./utils");

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("App started.");

  app.on("workflow_run.completed", async (context) => {
    try {
      const { payload } = context;
      if (payload.workflow.name !== "CI" || payload.action !== "completed") {
        return;
      }
      const check = await createCheckRun(context);
      const currentExtSize = await getCurrentArtifactSize(context);
      const latestReleaseExtSize = await getLatestReleaseExtensionSize(context);
      if (!currentExtSize || !latestReleaseExtSize) {
        return;
      }
      const { workflow_run: workflowRun } = payload;
      const { head_commit: commit } = workflowRun;
      const message = getMessage(
        currentExtSize,
        latestReleaseExtSize,
        commit.id
      );
      await commentOnPullRequest(context, message);
      await updateCheck({
        context,
        check,
        message,
        sizeDiff: currentExtSize - latestReleaseExtSize,
      });
    } catch (error) {
      console.log(error);
    }
  });
};
