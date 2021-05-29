const fetch = require("node-fetch");

const getCurrentArtifactSize = async (context) => {
  try {
    const { payload } = context;
    const { artifacts_url } = payload.workflow_run;
    const { artifacts } = await (await fetch(artifacts_url)).json();
    const extension =
      artifacts && artifacts.find((artifact) => artifact.name === "extension");
    return extension ? extension.size_in_bytes : null;
  } catch (error) {
    context.log.info(error);
    return null;
  }
};

module.exports = getCurrentArtifactSize;
