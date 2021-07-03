const bytes = require("bytes");
const commentOnPullRequests = require("../utils/commentOnPullRequests");
const createCheckRun = require("../utils/createCheckRun");
const getCurrentArtifactSize = require("../utils/getCurrentArtifactSize");
const getLatestReleaseExtensionSize = require("../utils/getLatestReleaseExtensionSize");
const { getMessage, getEmoji } = require("../utils/index");
const updateCheck = require("../utils/updateCheck");
const { CHECK_NAME } = require("../constants");

/**
 * @param {import('probot').Context} context
 */
const addChecksAndComment = async (context, req) => {
  const { headSha, check, config } = req;
  const currentExtSize = await getCurrentArtifactSize(
    context,
    config.workflow.artifact
  );
  const latestReleaseExtSize = await getLatestReleaseExtensionSize(context);
  const sizeDiff = currentExtSize - latestReleaseExtSize;
  const message = getMessage(currentExtSize, latestReleaseExtSize, headSha);
  if (sizeDiff >= config.commentThreshold) {
    await commentOnPullRequests(context, message);
  }
  await updateCheck({
    context,
    check,
    checkOutput: {
      conclusion: "success",
      title: `Total size difference - ${bytes(sizeDiff)} ${getEmoji(sizeDiff)}`,
      message,
    },
  });
};

/**
 * @param {import('probot').Context} context
 */
const addFailedCheck = async (context, req) => {
  const { check } = req;
  await updateCheck({
    context,
    check,
    checkOutput: {
      conclusion: "failure",
      title: "Build faild. Make sure your CI build is passing.",
      message:
        "Your CI build failed. Please check and make sure it passes. If CI build passes then only this check is executed.",
    },
  });
};

/**
 * @param {import('probot').Context} context
 */
const createCheck = async (context, req) =>
  createCheckRun({
    context,
    name: CHECK_NAME,
    commitId: req.headSha,
    checkOutput: {
      title: "Check is in progress",
      message: "Waiting...",
      status: "in_progress",
    },
  });

module.exports = {
  addChecksAndComment,
  addFailedCheck,
  createCheck,
};
