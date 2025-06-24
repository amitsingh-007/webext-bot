import { type Context } from 'probot';

export const commentOnPullRequest = async (
  context: Context<'workflow_run' | 'pull_request'>,
  message: string,
  prNumber: number
) => {
  try {
    const params = context.issue({
      body: message,
      issue_number: prNumber,
    });
    await context.octokit.issues.createComment(params);
  } catch (error: any) {
    context.log.info(error);
  }
};

export const commentOnPullRequests = async (
  context: Context<'workflow_run.completed'>,
  message: string
) => {
  try {
    const { workflow_run } = context.payload;
    const { pull_requests: pullRequests } = workflow_run;
    if (!pullRequests) {
      return;
    }

    pullRequests.forEach(async (pullRequest) => {
      await commentOnPullRequest(context, message, pullRequest.number);
    });
  } catch (error: any) {
    context.log.info(error);
  }
};
