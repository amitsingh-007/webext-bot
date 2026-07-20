import { type Probot } from 'probot';
import { OWNER, REPO } from '../helpers';

// The event shape accepted by `probot.receive`; payloads carry only the
// fields the handlers read, cast to satisfy the full webhook schema.
type ReceiveEvent = Parameters<Probot['receive']>[0];

const repository = {
  name: REPO,
  owner: { login: OWNER },
};

const installation = { id: 1 };

export const HEAD_SHA = 'headsha0000000000000000000000000000000000';
export const BASE_SHA = 'basesha0000000000000000000000000000000000';
export const PR_NUMBER = 7;
export const ISSUE_NUMBER = 3;
export const WORKFLOW_RUN_ID = 12_345;

export const pullRequestOpened = (branch = 'feature/awesome'): ReceiveEvent =>
  ({
    id: 'pr-opened',
    name: 'pull_request',
    payload: {
      action: 'opened',
      number: PR_NUMBER,
      pull_request: {
        number: PR_NUMBER,
        head: { ref: branch, sha: HEAD_SHA },
        base: { ref: 'main', sha: BASE_SHA },
      },
      repository,
      installation,
    },
  }) as unknown as ReceiveEvent;

export const pullRequestSynchronize = (branch = 'feature/awesome'): ReceiveEvent =>
  ({
    id: 'pr-sync',
    name: 'pull_request',
    payload: {
      action: 'synchronize',
      number: PR_NUMBER,
      before: BASE_SHA,
      after: HEAD_SHA,
      pull_request: {
        number: PR_NUMBER,
        head: { ref: branch, sha: HEAD_SHA },
        base: { ref: 'main', sha: BASE_SHA },
      },
      repository,
      installation,
    },
  }) as unknown as ReceiveEvent;

export const issuesOpened = (): ReceiveEvent =>
  ({
    id: 'issue-opened',
    name: 'issues',
    payload: {
      action: 'opened',
      issue: { number: ISSUE_NUMBER },
      repository,
      installation,
    },
  }) as unknown as ReceiveEvent;

export const workflowRunCompleted = (options?: {
  workflowName?: string;
  headBranch?: string;
  conclusion?: string;
  pullRequests?: Array<{ number: number }>;
}): ReceiveEvent =>
  ({
    id: 'wf-run',
    name: 'workflow_run',
    payload: {
      action: 'completed',
      workflow: { name: options?.workflowName ?? 'Build' },
      workflow_run: {
        id: WORKFLOW_RUN_ID,
        head_branch: options?.headBranch ?? 'feature/awesome',
        head_commit: { id: HEAD_SHA },
        conclusion: options?.conclusion ?? 'success',
        pull_requests: options?.pullRequests ?? [{ number: PR_NUMBER }],
      },
      repository,
      installation,
    },
  }) as unknown as ReceiveEvent;
