import { Workflow, WorkflowRun } from "@octokit/webhooks-types";
import minimatch from "minimatch";
import semver from "semver";
import { IConfig } from "../constants/config";

export const shouldIgnoreBranch = (config: IConfig, branch: string): boolean =>
  config["branches-ignore"].some((branchGlob) => minimatch(branch, branchGlob));

export const shouldSkipWorkflow = (
  workflow: Workflow,
  workflowRun: WorkflowRun,
  config: IConfig
) =>
  workflow.name !== config.workflow.name ||
  shouldIgnoreBranch(config, workflowRun.head_branch);

export const isValidVersion = (oldVersion: string, newVersion: string) =>
  semver.valid(newVersion) && semver.gte(newVersion, oldVersion);
