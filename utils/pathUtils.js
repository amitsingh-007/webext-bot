import normalize from "normalize-path";
import path from "path";

/**
 * @param {import('../classes/config') config
 */
export const getManifestPath = (config) => {
  const { manifest } = config;
  return normalize(path.normalize(path.join(manifest.dir, manifest.name)));
};
