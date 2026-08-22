import { type Context } from 'probot';
import { type IConfig } from '../constants/config';

export const commentOnPullRequest = async (
  ctx: Context<'workflow_run' | 'pull_request'>,
  message: string,
  prNumber: number
) => {
  try {
    await ctx.octokit.rest.issues.createComment(
      ctx.issue({ body: message, issue_number: prNumber })
    );
  } catch (error) {
    ctx.log.info(error);
  }
};

export const addAssignees = async (ctx: Context, config: IConfig, number: number) => {
  const assignees = config['auto-assign'];
  if (!assignees?.length) {
    return;
  }

  try {
    await ctx.octokit.rest.issues.addAssignees(ctx.issue({ issue_number: number, assignees }));
  } catch (error) {
    ctx.log.info(error);
  }
};
