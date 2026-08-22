import { type Probot } from 'probot';
import { shouldSkipWorkflow, shouldIgnoreBranch } from './utils/validate';
import { addChecksAndComment, addFailedCheck, createCheckRun } from './services/checkRunsService';
import { addAssignees } from './utils/github';
import { fetchConfig } from './utils/fetch';
import { processPullRequest } from './services/pullRequestService';

const probotApp = (app: Probot) => {
  app.log.info('App started.');

  const on: Probot['on'] = (event, handler) =>
    app.on(event, async (context) => {
      try {
        await handler(context);
      } catch (error: any) {
        context.log.error(error);
      }
    });

  on('workflow_run.completed', async (context) => {
    const { workflow, workflow_run } = context.payload;
    const { head_commit } = workflow_run;
    const config = await fetchConfig(context, head_commit.id);
    if (shouldSkipWorkflow(workflow, workflow_run, config)) {
      return;
    }

    const check = await createCheckRun(context, head_commit.id);
    if (!check) return;
    if (workflow_run.conclusion !== 'success') {
      await addFailedCheck(context, check);
      return;
    }

    await addChecksAndComment(context, {
      headSha: head_commit.id,
      check,
      config,
    });
  });

  on('pull_request.synchronize', async (context) => {
    const { before, after, pull_request } = context.payload;
    await processPullRequest(context, {
      beforeSha: before,
      afterSha: after,
      prNumber: pull_request.number,
      branch: pull_request.head.ref,
    });
  });

  on('pull_request.opened', async (context) => {
    const { number, head, base } = context.payload.pull_request;
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
  });

  on('issues.opened', async (context) => {
    const config = await fetchConfig(context);
    await addAssignees(context, config, context.payload.issue.number);
  });
};

export default probotApp;
