import { type Context } from 'probot';
import { type IConfig } from '../constants/config';

export const addAssignees = async (
  context: Context,
  config: IConfig,
  number: number
) => {
  try {
    const assignees = config['auto-assign'];
    if (!assignees?.length) {
      return;
    }

    const params = context.issue({
      issue_number: number,
      assignees,
    });
    await context.octokit.issues.addAssignees(params);
  } catch (error: any) {
    context.log.info(error);
  }
};
