/**
 * @param {import('probot').Context} context
 */
const commentOnPullRequest = async (context, message, prNumber) => {
  try {
    const params = context.issue({
      body: message,
      issue_number: prNumber,
    });
    await context.octokit.issues.createComment(params);
  } catch (err) {
    console.log(err);
  }
};

module.exports = commentOnPullRequest;
