const createCheckRun = async (context) => {
  try {
    const { payload } = context;
    const { repository, workflow_run } = payload;
    const response = await context.octokit.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name: "Web Ext",
      head_sha: workflow_run.head_commit.id,
      status: "in_progress",
      started_at: new Date().toISOString(),
      output: {
        title: "Web Ext check is in progress",
        summary: "Waiting...",
      },
    });
    return {
      checkId: response.data.id,
      detailsUrl: response.data.html_url,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = createCheckRun;
