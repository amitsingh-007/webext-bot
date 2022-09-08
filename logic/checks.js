import bytes from "bytes";
import commentOnPullRequests from "../utils/commentOnPullRequests";
import createCheckRun from "../utils/createCheckRun";
import getCurrentArtifactSize from "../utils/getCurrentArtifactSize";
import getLatestReleaseExtensionSize from "../utils/getLatestReleaseExtensionSize";
import { getMessage, getEmoji } from "../utils/index";
import updateCheck from "../utils/updateCheck";
import { CHECK_NAME } from "../constants";

/**
 * @param {import('probot').Context} context
 */
export const addChecksAndComment = async (context, req) => {
  const { headSha, check, config } = req;
  const currentExtSize = await getCurrentArtifactSize(
    context,
    config.workflow.artifact
  );
  const latestReleaseExtSize = await getLatestReleaseExtensionSize(context);
  const actualSizeDiff = currentExtSize - latestReleaseExtSize;
  const absoluteSizeDiff = Math.abs(actualSizeDiff);
  const message = getMessage(currentExtSize, latestReleaseExtSize, headSha);
  if (absoluteSizeDiff >= config.commentThreshold) {
    await commentOnPullRequests(context, message);
  }
  await updateCheck({
    context,
    check,
    checkOutput: {
      conclusion: "success",
      title: `Total size difference: ${bytes(absoluteSizeDiff)} ${getEmoji(
        actualSizeDiff
      )}`,
      message,
    },
  });
};

/**
 * @param {import('probot').Context} context
 */
export const addFailedCheck = async (context, req) => {
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
export const createCheck = async (context, req) =>
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
