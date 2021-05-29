const bytes = require("bytes");
const { getEmoji } = require("./index");

const updateCheck = async ({ context, check, message, sizeDiff }) => {
  try {
    await context.octokit.checks.update({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      check_run_id: check.checkId,
      name: "Web Ext",
      head_sha: context.payload.workflow_run.head_commit.id,
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
