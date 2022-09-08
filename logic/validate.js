import minimatch from "minimatch";

/**
 * @param {import('../classes/config')} config
 */
export const shouldIgnoreBranch = (config, branch) =>
  config.branchesIgnore.some((branchGlob) => minimatch(branch, branchGlob));

/**
 * @param {import('../classes/config')} config
 */
export const shouldSkipWorkflow = (workflow, workflowRun, config) => {
  return (
    workflow.name !== config.workflow.name ||
    shouldIgnoreBranch(config, workflowRun.head_branch)
  );
};
