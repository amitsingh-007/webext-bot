import { gt } from "semver";
import { getManifestPath } from "../utils/pathUtils";
import commentOnPullRequest from "../utils/commentOnPullRequest";
import getContent from "../utils/getContent";
import isValidVersion from "../utils/isValidVersion";
import getConfig from "./getConfig";

const failMessage = `
Please check the extension version in the manifest.
* New version can't be less than existing version.
* Check the version format.`;

/**
 * @param {import('probot').Context} context
 */
const processPullRequest = async (context, req) => {
  const { afterSha, beforeSha, prNumber } = req;
  const config = await getConfig(context, { sha: afterSha });
  const manifestFilePath = getManifestPath(config);
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
  if (gt(newVersion, oldVersion)) {
    await commentOnPullRequest(
      context,
      `Extension version is updated from \`${oldVersion}\` to \`${newVersion}\``,
      prNumber
    );
  }
};

export default processPullRequest;
