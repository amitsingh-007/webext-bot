import { Context } from "probot";
import semver from "semver";
import { commentOnPullRequest } from "./commentService";
import { fetchConfig, fetchFile } from "../utils/fetch";
import path from "path";
import normalize from "normalize-path";
import { isValidVersion, shouldIgnoreBranch } from "../utils/validate";

const failMessage = `
Please check the extension version in the manifest.
* New version can't be less than existing version.
* Check the version format.`;

export const processPullRequest = async (
  context: Context<"pull_request">,
  req: {
    afterSha: string;
    beforeSha: string;
    prNumber: number;
    branch: string;
  }
) => {
  const { afterSha, beforeSha, prNumber, branch } = req;
  const config = await fetchConfig(context, afterSha);
  if (shouldIgnoreBranch(config, branch)) {
    return;
  }
  const { manifest } = config;
  const manifestFilePath = normalize(
    path.normalize(path.join(manifest.dir, manifest.name))
  );
  const currentManifest = await fetchFile(context, manifestFilePath, afterSha);
  const latestReleaseManifest = await fetchFile(
    context,
    manifestFilePath,
    beforeSha
  );
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
