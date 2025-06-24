import { type Context } from 'probot';
import semver from 'semver';
import { fetchConfig, fetchFile, fetchManifest } from '../utils/fetch';
import { isValidVersion, shouldIgnoreBranch } from '../utils/validate';
import { commentOnPullRequest } from './commentService';

const failMessage = `
Please check the extension version in the manifest.
* New version can't be less than existing version.
* Check the version format.`;

export const processPullRequest = async (
  context: Context<'pull_request'>,
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

  const currentManifest = await fetchManifest(context, config, afterSha);
  const latestReleaseManifest = await fetchManifest(context, config, beforeSha);
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
