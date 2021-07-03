const path = require("path");
const normalize = require("normalize-path");

/**
 * @param {import('../classes/config') config
 */
const getManifestPath = (config) => {
  const { manifest } = config;
  return normalize(path.normalize(path.join(manifest.dir, manifest.name)));
};

module.exports = {
  getManifestPath,
};
