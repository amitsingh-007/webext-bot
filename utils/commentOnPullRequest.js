const commentOnPullRequest = async (context, message) => {
  try {
    const { payload, octokit } = context;
    const { workflow_run } = payload;
    const { pull_requests: pullRequests } = workflow_run;
    if (!pullRequests) {
      return;
    }
    pullRequests.forEach(async (pullRequest) => {
      const params = context.issue({
        body: message,
        issue_number: pullRequest.number,
      });
      await octokit.issues.createComment(params);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = commentOnPullRequest;
