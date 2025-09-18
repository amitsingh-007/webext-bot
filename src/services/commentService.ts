import { type Context } from 'probot';

export const commentOnPullRequest = async (
  ctx: Context<'workflow_run' | 'pull_request'>,
  message: string,
  prNumber: number
) => {
  try {
    const params = ctx.issue({
      body: message,
      issue_number: prNumber,
    });
    await ctx.octokit.rest.issues.createComment(params);
  } catch (error: any) {
    ctx.log.info(error);
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
      if (pullRequest?.number) {
        await commentOnPullRequest(context, message, pullRequest.number);
      }
    });
  } catch (error: any) {
    context.log.info(error);
  }
};
