const createCheckRun = async (context) => {
  try {
    const response = await context.octokit.checks.create({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      name: "Web Ext",
      head_sha: context.payload.workflow_run.head_commit.id,
      status: "in_progress",
      started_at: new Date().toISOString(),
      output: {
        title: "Web Ext check is in progress",
        summary: "Waiting...",
      },
    });
    console.log(response);
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
