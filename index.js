import processPullRequest from "./logic/pullRequest";
import {
  addChecksAndComment,
  addFailedCheck,
  createCheck,
} from "./logic/checks";
import getConfig from "./logic/getConfig";
import { shouldSkipWorkflow, shouldIgnoreBranch } from "./logic/validate";
import addAssignees from "./utils/addAssignees";

/**
 * @param {import('probot').Probot} app
 */
const probotApp = (app) => {
  app.log.info("App started.");

  app.on("workflow_run.completed", async (context) => {
    try {
      const { workflow, workflow_run } = context.payload;
      const { head_commit } = workflow_run;
      const config = await getConfig(context, { sha: head_commit.id });
      if (shouldSkipWorkflow(workflow, workflow_run, config)) {
        return;
      }
      const check = await createCheck(context, { headSha: head_commit.id });
      if (workflow_run.conclusion !== "success") {
        await addFailedCheck(context, { check });
        return;
      }
      await addChecksAndComment(context, {
        headSha: head_commit.id,
        check,
        config,
      });
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
      const config = await getConfig(context, { sha: head.sha });
      await processPullRequest(context, {
        beforeSha: base.sha,
        afterSha: head.sha,
        prNumber: number,
      });
      if (!shouldIgnoreBranch(config, head.ref)) {
        await addAssignees(context, {
          config,
          number,
        });
      }
    } catch (error) {
      context.log.info(error);
    }
  });

  app.on("issues.opened", async (context) => {
    try {
      const config = await getConfig(context);
      await addAssignees(context, {
        config,
        number: context.payload.issue.number,
      });
    } catch (error) {
      context.log.error(error);
    }
  });
};

export default probotApp;
