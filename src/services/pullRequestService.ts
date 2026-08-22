import { type Context } from 'probot';
import semver from 'semver';
import { fetchManifest } from '../utils/fetch';
import { isValidVersion } from '../utils/validate';
import { commentOnPullRequest } from '../utils/github';
import { type IConfig } from '../constants/config';

const failMessage = `
Please check the extension version in the manifest.
* New version can't be less than existing version.
* Check the version format.`;

export const processPullRequest = async (
  context: Context<'pull_request'>,
  config: IConfig,
  req: {
    afterSha: string;
    beforeSha: string;
    prNumber: number;
  }
) => {
  const { afterSha, beforeSha, prNumber } = req;
  const [currentManifest, latestReleaseManifest] = await Promise.all([
    fetchManifest(context, config, afterSha),
    fetchManifest(context, config, beforeSha),
  ]);
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
