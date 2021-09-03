const Config = require("../classes/config");
const getContent = require("../utils/getContent");

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

module.exports = getConfig;
