const bytes = require("bytes");
const { getEmoji } = require("./index");

const updateCheck = async ({ context, check, message, sizeDiff }) => {
  const { payload } = context;
  const { repository, workflow_run } = payload;
  try {
    await context.octokit.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: check.checkId,
      name: "Web Ext",
      head_sha: workflow_run.head_commit.id,
      status: "completed",
      conclusion: "success",
      completed_at: new Date().toISOString(),
      details_url: check.detailsUrl,
      output: {
        title: `Total size difference - ${bytes(sizeDiff)} ${getEmoji(
          sizeDiff
        )}`,
        summary: message,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = updateCheck;
