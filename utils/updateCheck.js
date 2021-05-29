const { CHECK_NAME } = require("../constants");

const updateCheck = async ({ context, check, checkOutput }) => {
  const { payload } = context;
  const { repository, workflow_run } = payload;
  try {
    await context.octokit.checks.update({
      owner: repository.owner.login,
      repo: repository.name,
      check_run_id: check.checkId,
      name: CHECK_NAME,
      head_sha: workflow_run.head_commit.id,
      status: "completed",
      conclusion: checkOutput.conclusion,
      completed_at: new Date().toISOString(),
      details_url: check.detailsUrl,
      output: {
        title: checkOutput.title,
        summary: checkOutput.message,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = updateCheck;
