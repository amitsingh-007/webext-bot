const processPullRequest = require("./logic/pullRequest");
const {
  addChecksAndComment,
  addFailedCheck,
  createCheck,
} = require("./logic/checks");

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
      const check = await createCheck(context, { headSha: head_commit.id });
      if (workflow_run.conclusion !== "success") {
        await addFailedCheck(context, { check });
        return;
      }
      await addChecksAndComment(context, { headSha: head_commit.id, check });
    } catch (error) {
      app.log.info(error);
    }
  });

  app.on("pull_request.synchronize", async (context) => {
    try {
      const { before, after, pull_request } = context.payload;
      await processPullRequest(context, {
        beforeSha: before,
        afterSha: after,
        prNumber: pull_request.number,
      });
    } catch (error) {
      context.log.info(error);
    }
  });

  app.on("pull_request.opened", async (context) => {
    try {
      const { pull_request } = context.payload;
      const { number, head, base } = pull_request;
      await processPullRequest(context, {
        beforeSha: base.sha,
        afterSha: head.sha,
        prNumber: number,
      });
    } catch (error) {
      context.log.info(error);
    }
  });
};

module.exports = app;
