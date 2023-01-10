import { Context } from "probot";
import Config from "../classes/config";

export const addAssignees = async (
  context: Context,
  config: Config,
  number: number
) => {
  try {
    const params = context.issue({
      issue_number: number,
      assignees: config.autoAssign,
    });
    await context.octokit.issues.addAssignees(params);
  } catch (err: any) {
    context.log.info(err);
  }
};
