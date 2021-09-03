const YAML = require("yaml");

const getContent = async ({ context, path, ref }) => {
  try {
    const params = context.repo({ path, ref });
    const response = await context.octokit.repos.getContent(params);
    const { content, encoding } = response.data;
    const decodedContent = Buffer.from(content, encoding).toString();
    return YAML.parse(decodedContent);
  } catch (error) {
    context.log.info(error);
    return null;
  }
};

module.exports = getContent;
