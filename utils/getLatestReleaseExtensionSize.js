const getLatestReleaseExtensionSize = async (context) => {
  try {
    const { octokit } = context;
    const params = context.repo({});
    const res = await octokit.repos.getLatestRelease(params);
    if (!res || !res.data || !res.data.assets) {
      return null;
    }
    const [latestReleasedExtension] = res.data.assets;
    return latestReleasedExtension ? latestReleasedExtension.size : null;
  } catch (error) {
    context.log.info(error);
    return null;
  }
};

module.exports = getLatestReleaseExtensionSize;
