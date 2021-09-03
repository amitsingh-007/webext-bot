const minimatch = require("minimatch");

/**
 * @param {import('../classes/config')} config
 */
const shouldIgnoreBranch = (config, branch) =>
  config.branchesIgnore.some((branchGlob) => minimatch(branch, branchGlob));

/**
 * @param {import('../classes/config')} config
 */
const shouldSkipWorkflow = (workflow, workflowRun, config) => {
  return (
    workflow.name !== config.workflow.name ||
    shouldIgnoreBranch(config, workflowRun.head_branch)
  );
};

module.exports = {
  shouldSkipWorkflow,
  shouldIgnoreBranch,
};
