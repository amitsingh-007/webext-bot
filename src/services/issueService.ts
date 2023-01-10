import { Context } from "probot";
import { IConfig } from "../constants/config";

export const addAssignees = async (
  context: Context,
  config: IConfig,
  number: number
) => {
  const assignees = config["auto-assign"];
  if (!assignees?.length) {
    return;
  }
  try {
    const params = context.issue({
      issue_number: number,
      assignees,
    });
    await context.octokit.issues.addAssignees(params);
  } catch (err: any) {
    context.log.info(err);
  }
};
