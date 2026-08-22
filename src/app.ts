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
      } catch (error) {
        context.log.error(error);
      }
    });

  on('workflow_run.completed', async (context) => {
    const { workflow, workflow_run } = context.payload;
    const config = await fetchConfig(context, workflow_run.head_commit.id);
    if (shouldSkipWorkflow(workflow, workflow_run, config)) {
      return;
    }

    const check = await createCheckRun(context);
    if (workflow_run.conclusion !== 'success') {
      await addFailedCheck(context, check);
      return;
    }

    await addChecksAndComment(context, check, config);
  });

  on('pull_request.synchronize', async (context) => {
    const { before, after, pull_request } = context.payload;
    const config = await fetchConfig(context, after);
    if (shouldIgnoreBranch(config, pull_request.head.ref)) {
      return;
    }

    await processPullRequest(context, config, {
      beforeSha: before,
      afterSha: after,
      prNumber: pull_request.number,
    });
  });

  on('pull_request.opened', async (context) => {
    const { number, head, base } = context.payload.pull_request;
    const config = await fetchConfig(context, head.sha);
    if (shouldIgnoreBranch(config, head.ref)) {
      return;
    }

    await processPullRequest(context, config, {
      beforeSha: base.sha,
      afterSha: head.sha,
      prNumber: number,
    });
    await addAssignees(context, config, number);
  });

  on('issues.opened', async (context) => {
    const config = await fetchConfig(context);
    await addAssignees(context, config, context.payload.issue.number);
  });
};

export default probotApp;
