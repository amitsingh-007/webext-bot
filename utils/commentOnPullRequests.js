const commentOnPullRequest = require("./commentOnPullRequest");

/**
 * @param {import('probot').Context} context
 */
const commentOnPullRequests = async (context, message) => {
  try {
    const { workflow_run } = context.payload;
    const { pull_requests: pullRequests } = workflow_run;
    if (!pullRequests) {
      return;
    }
    pullRequests.forEach(async (pullRequest) => {
      await commentOnPullRequest(context, message, pullRequest.number);
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = commentOnPullRequests;
