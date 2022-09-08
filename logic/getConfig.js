import Config from "../classes/config";
import getContent from "../utils/getContent";

/**
 * @param {import('probot').Context} context
 */
const getConfig = async (context, req = {}) => {
  const response = await getContent({
    context,
    path: ".github/webext.yml",
    ref: req.sha,
  });
  return new Config(response);
};

export default getConfig;
