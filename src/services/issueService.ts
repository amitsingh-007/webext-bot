import { type Context } from 'probot';
import { type IConfig } from '../constants/config';

export const addAssignees = async (
  ctx: Context,
  config: IConfig,
  number: number
) => {
  try {
    const assignees = config['auto-assign'];
    if (!assignees?.length) {
      return;
    }

    const params = ctx.issue({
      issue_number: number,
      assignees,
    });
    await ctx.octokit.rest.issues.addAssignees(params);
  } catch (error: any) {
    ctx.log.info(error);
  }
};
