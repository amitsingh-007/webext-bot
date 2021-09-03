/**
 * @param {import('probot').Context} context
 */
const addAssignees = async (context, req) => {
  try {
    const { number, config } = req;
    const params = context.issue({
      issue_number: number,
      assignees: config.autoAssign,
    });
    await context.octokit.issues.addAssignees(params);
  } catch (err) {
    console.log(err);
  }
};

module.exports = addAssignees;
