const axios = require("axios").default;

const getCurrentArtifactSize = async (context, artifactName) => {
  try {
    const { payload } = context;
    const { artifacts_url } = payload.workflow_run;
    const response = await axios.get(artifacts_url);
    const { artifacts } = response.data;
    const extension =
      artifacts && artifacts.find((artifact) => artifact.name === artifactName);
    return extension ? extension.size_in_bytes : null;
  } catch (error) {
    context.log.info(error);
    return null;
  }
};

module.exports = getCurrentArtifactSize;
