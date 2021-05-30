const semver = require("semver");
const { manifestFilePath } = require("../constants");
const commentOnPullRequest = require("../utils/commentOnPullRequest");
const getContent = require("../utils/getContent");
const isValidVersion = require("../utils/isValidVersion");

const failMessage = `
Please check the extension version in the manifest.
* New version can't be less than existing version.
* Check the version format.`;

/**
 * @param {import('probot').Context} context
 */
const processPullRequest = async (context, req) => {
  const { afterSha, beforeSha, prNumber } = req;
  const currentManifest = await getContent({
    context,
    path: manifestFilePath,
    ref: afterSha,
  });
  const latestReleaseManifest = await getContent({
    context,
    path: manifestFilePath,
    ref: beforeSha,
  });
  const oldVersion = latestReleaseManifest.version;
  const newVersion = currentManifest.version;
  if (!isValidVersion(oldVersion, newVersion)) {
    await commentOnPullRequest(context, failMessage, prNumber);
    return;
  }
  if (semver.gt(newVersion, oldVersion)) {
    await commentOnPullRequest(
      context,
      `Extension version is updated from \`${oldVersion}\` to \`${newVersion}\``,
      prNumber
    );
  }
};

module.exports = processPullRequest;
