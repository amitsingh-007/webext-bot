const commentOnPullRequest = async (context, message) => {
  try {
    const { pull_requests: pullRequests } = context.payload.workflow_run;
    if (!pullRequests) {
      return;
    }
    pullRequests.forEach(async (pullRequest) => {
      const params = context.issue({
        body: message,
        issue_number: pullRequest.number,
      });
      await context.octokit.issues.createComment(params);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = commentOnPullRequest;
