import { shouldSkipWorkflow, shouldIgnoreBranch } from "./utils/validate";
import { Probot } from "probot";
import {
  addChecksAndComment,
  addFailedCheck,
  createCheckRun,
} from "./services/checkRunsService";
import { addAssignees } from "./services/issueService";
import { fetchConfig } from "./utils/fetch";
import { processPullRequest } from "./services/pullRequestService";

const probotApp = (app: Probot) => {
  app.log.info("App started.");

  app.on("workflow_run.completed", async (context) => {
    try {
      const { workflow, workflow_run } = context.payload;
      const { head_commit } = workflow_run;
      const config = await fetchConfig(context, head_commit.id);
      if (shouldSkipWorkflow(workflow, workflow_run, config)) {
        return;
      }
      const check = await createCheckRun(context, head_commit.id);
      if (!check) return;
      if (workflow_run.conclusion !== "success") {
        return await addFailedCheck(context, check);
      }
      await addChecksAndComment(context, {
        headSha: head_commit.id,
        check,
        config,
      });
    } catch (error: any) {
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
        branch: pull_request.head.ref,
      });
    } catch (error: any) {
      context.log.info(error);
    }
  });

  app.on("pull_request.opened", async (context) => {
    try {
      const { pull_request } = context.payload;
      const { number, head, base } = pull_request;
      const config = await fetchConfig(context, head.sha);
      await processPullRequest(context, {
        beforeSha: base.sha,
        afterSha: head.sha,
        prNumber: number,
        branch: head.ref,
      });
      if (!shouldIgnoreBranch(config, head.ref)) {
        await addAssignees(context, config, number);
      }
    } catch (error: any) {
      context.log.info(error);
    }
  });

  app.on("issues.opened", async (context) => {
    try {
      const config = await fetchConfig(context);
      await addAssignees(context, config, context.payload.issue.number);
    } catch (error: any) {
      context.log.error(error);
    }
  });
};

export default probotApp;
