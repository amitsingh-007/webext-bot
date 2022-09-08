const createCheckRun = async ({ context, name, commitId, checkOutput }) => {
  try {
    const { repository } = context.payload;
    const response = await context.octokit.checks.create({
      owner: repository.owner.login,
      repo: repository.name,
      name,
      head_sha: commitId,
      status: checkOutput.status,
      started_at: new Date().toISOString(),
      conclusion: checkOutput.conclusion,
      output: {
        title: checkOutput.title,
        summary: checkOutput.message,
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

export default createCheckRun;
