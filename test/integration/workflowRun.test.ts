import nock from 'nock';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import {
  newProbot,
  GITHUB_API,
  contentsPath,
  configEnvelope,
} from '../helpers';
import {
  workflowRunCompleted,
  WORKFLOW_RUN_ID,
  PR_NUMBER,
} from '../fixtures/payloads';

let probot: Awaited<ReturnType<typeof newProbot>>;

beforeEach(async () => {
  nock.disableNetConnect();
  probot = await newProbot();
});

afterEach(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

const repo = '/repos/amitsingh-007/webext-bot';
const configPath = contentsPath('.github/webext.yml');
const CHECK_ID = 999;

const mockConfig = (scope: nock.Scope) =>
  scope.get(configPath).query(true).reply(200, configEnvelope());

const mockCreateCheck = (scope: nock.Scope) =>
  scope
    .post(`${repo}/check-runs`)
    .reply(201, { id: CHECK_ID, html_url: 'https://github.com/check' });

const mockArtifacts = (scope: nock.Scope, sizeInBytes?: number) =>
  scope.get(`${repo}/actions/runs/${WORKFLOW_RUN_ID}/artifacts`).reply(200, {
    total_count: sizeInBytes === undefined ? 0 : 1,
    artifacts:
      sizeInBytes === undefined
        ? []
        : [{ name: 'extension', size_in_bytes: sizeInBytes }],
  });

const mockLatestRelease = (scope: nock.Scope, size?: number) =>
  scope
    .get(`${repo}/releases/latest`)
    .reply(200, { assets: size === undefined ? [] : [{ size }] });

describe('workflow_run.completed', () => {
  it('skips when the workflow name does not match config', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    const createMock = nock(GITHUB_API)
      .post(/\/check-runs$/)
      .reply(201, {});

    await probot.receive(workflowRunCompleted({ workflowName: 'Other' }));

    expect(createMock.isDone()).toBe(false);
  });

  it('marks the check failed when the run did not succeed', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    mockCreateCheck(scope);

    let conclusion = '';
    scope
      .patch(
        `${repo}/check-runs/${CHECK_ID}`,
        (body: { conclusion: string }) => {
          conclusion = body.conclusion;
          return true;
        }
      )
      .reply(200, {});

    await probot.receive(workflowRunCompleted({ conclusion: 'failure' }));

    expect(nock.pendingMocks()).toStrictEqual([]);
    expect(conclusion).toBe('failure');
  });

  it('updates the check and comments when the diff meets the threshold', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    mockCreateCheck(scope);
    mockArtifacts(scope, 200_000);
    mockLatestRelease(scope, 100_000);

    let commentBody = '';
    scope
      .post(
        `${repo}/issues/${PR_NUMBER}/comments`,
        (body: { body: string }) => {
          commentBody = body.body;
          return true;
        }
      )
      .reply(201, {});

    let conclusion = '';
    scope
      .patch(
        `${repo}/check-runs/${CHECK_ID}`,
        (body: { conclusion: string }) => {
          conclusion = body.conclusion;
          return true;
        }
      )
      .reply(200, {});

    await probot.receive(workflowRunCompleted());

    expect(nock.pendingMocks()).toStrictEqual([]);
    expect(conclusion).toBe('success');
    expect(commentBody).toContain('Extension Size Change');
  });

  it('updates the check but does not comment when the diff is below threshold', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    mockCreateCheck(scope);
    mockArtifacts(scope, 100_050);
    mockLatestRelease(scope, 100_000);
    const updateMock = scope
      .patch(`${repo}/check-runs/${CHECK_ID}`)
      .reply(200, {});

    const commentMock = nock(GITHUB_API)
      .post(/\/comments$/)
      .reply(201, {});

    await probot.receive(workflowRunCompleted());

    expect(updateMock.isDone()).toBe(true);
    expect(commentMock.isDone()).toBe(false);
  });

  it('does not update the check when the artifact is missing', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    mockCreateCheck(scope);
    mockArtifacts(scope); // No matching artifact
    mockLatestRelease(scope, 100_000);

    const updateMock = nock(GITHUB_API)
      .patch(/\/check-runs\//)
      .reply(200, {});

    await probot.receive(workflowRunCompleted());

    expect(updateMock.isDone()).toBe(false);
  });

  it('does not update the check when there is no release asset', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    mockCreateCheck(scope);
    mockArtifacts(scope, 200_000);
    mockLatestRelease(scope); // No assets

    const updateMock = nock(GITHUB_API)
      .patch(/\/check-runs\//)
      .reply(200, {});

    await probot.receive(workflowRunCompleted());

    expect(updateMock.isDone()).toBe(false);
  });

  it('updates the check but posts no comment when there are no PRs', async () => {
    const scope = nock(GITHUB_API);
    mockConfig(scope);
    mockCreateCheck(scope);
    mockArtifacts(scope, 200_000);
    mockLatestRelease(scope, 100_000);
    const updateMock = scope
      .patch(`${repo}/check-runs/${CHECK_ID}`)
      .reply(200, {});

    const commentMock = nock(GITHUB_API)
      .post(/\/comments$/)
      .reply(201, {});

    await probot.receive(workflowRunCompleted({ pullRequests: [] }));

    expect(updateMock.isDone()).toBe(true);
    expect(commentMock.isDone()).toBe(false);
  });
});
