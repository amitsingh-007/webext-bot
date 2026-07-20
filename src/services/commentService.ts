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
    const { pull_requests: pullRequests } = context.payload.workflow_run;
    const prNumbers = (pullRequests ?? [])
      .map((pullRequest) => pullRequest?.number)
      .filter((number): number is number => number !== undefined);

    await Promise.all(
      prNumbers.map(async (number) =>
        commentOnPullRequest(context, message, number)
      )
    );
  } catch (error: any) {
    context.log.info(error);
  }
};
