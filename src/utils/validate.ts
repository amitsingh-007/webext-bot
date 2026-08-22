import path from 'node:path';
import { type components } from '@octokit/openapi-webhooks-types';
import semver from 'semver';
import { type IConfig } from '../constants/config';

export const shouldIgnoreBranch = (config: IConfig, branch: string | null): boolean =>
  !branch || config['branches-ignore'].some((branchGlob) => path.matchesGlob(branch, branchGlob));

type WorkflowRun = components['schemas']['webhook-workflow-run-completed'];

export const shouldSkipWorkflow = (
  workflow: WorkflowRun['workflow'],
  workflowRun: WorkflowRun['workflow_run'],
  config: IConfig
) =>
  workflow?.name !== config.workflow.name || shouldIgnoreBranch(config, workflowRun?.head_branch);

export const isValidVersion = (oldVersion: string, newVersion: string) =>
  semver.valid(newVersion) && semver.gte(newVersion, oldVersion);
