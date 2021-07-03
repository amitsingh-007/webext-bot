const minimatch = require("minimatch");

/**
 * @param {import('../classes/config')} config
 */
const shouldSkipWorkflow = (workflow, workflowRun, config) => {
  return (
    workflow.name !== config.workflow.name ||
    config.branchesIgnore.some((branchGlob) =>
      minimatch(workflowRun.head_branch, branchGlob)
    )
  );
};

module.exports = shouldSkipWorkflow;
