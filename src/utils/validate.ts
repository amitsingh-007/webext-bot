import { Workflow, WorkflowRun } from "@octokit/webhooks-types";
import minimatch from "minimatch";
import semver from "semver";
import Config from "../classes/config";

export const shouldIgnoreBranch = (config: Config, branch: string): boolean =>
  config.branchesIgnore.some((branchGlob: any) =>
    minimatch(branch, branchGlob)
  );

export const shouldSkipWorkflow = (
  workflow: Workflow,
  workflowRun: WorkflowRun,
  config: Config
) =>
  workflow.name !== config.workflow.name ||
  shouldIgnoreBranch(config, workflowRun.head_branch);

export const isValidVersion = (oldVersion: string, newVersion: string) =>
  semver.valid(newVersion) && semver.gte(newVersion, oldVersion);
