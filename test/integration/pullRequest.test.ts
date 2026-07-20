import nock from 'nock';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import { newProbot, GITHUB_API, contentsPath, configEnvelope, manifestEnvelope } from '../helpers';
import {
  pullRequestOpened,
  pullRequestSynchronize,
  HEAD_SHA,
  BASE_SHA,
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

const configPath = contentsPath('.github/webext.yml');
const manifestPath = contentsPath('manifest.json');

describe('pull_request.opened', () => {
  it('comments on a version bump and adds assignees', async () => {
    const scope = nock(GITHUB_API);
    // `opened` fetches config twice (handler + processPullRequest).
    scope.get(configPath).query(true).twice().reply(200, configEnvelope());
    // Current (head) vs old (base) manifest, disambiguated by ref.
    scope.get(manifestPath).query({ ref: HEAD_SHA }).reply(200, manifestEnvelope('1.1.0'));
    scope.get(manifestPath).query({ ref: BASE_SHA }).reply(200, manifestEnvelope('1.0.0'));

    let commentBody = '';
    scope
      .post(
        `/repos/amitsingh-007/webext-bot/issues/${PR_NUMBER}/comments`,
        (body: { body: string }) => {
          commentBody = body.body;
          return true;
        }
      )
      .reply(201, {});

    let assignees: string[] = [];
    scope
      .post(
        `/repos/amitsingh-007/webext-bot/issues/${PR_NUMBER}/assignees`,
        (body: { assignees: string[] }) => {
          assignees = body.assignees;
          return true;
        }
      )
      .reply(201, {});

    await probot.receive(pullRequestOpened());

    expect(nock.pendingMocks()).toStrictEqual([]);
    expect(commentBody).toContain('Extension version is updated from `1.0.0` to `1.1.0`');
    expect(assignees).toEqual(['reviewer1']);
  });

  it('posts the fail message for an invalid/downgraded version', async () => {
    const scope = nock(GITHUB_API);
    scope.get(configPath).query(true).twice().reply(200, configEnvelope());
    scope.get(manifestPath).query({ ref: HEAD_SHA }).reply(200, manifestEnvelope('0.9.0'));
    scope.get(manifestPath).query({ ref: BASE_SHA }).reply(200, manifestEnvelope('1.0.0'));

    let commentBody = '';
    scope
      .post(
        `/repos/amitsingh-007/webext-bot/issues/${PR_NUMBER}/comments`,
        (body: { body: string }) => {
          commentBody = body.body;
          return true;
        }
      )
      .reply(201, {});
    scope.post(`/repos/amitsingh-007/webext-bot/issues/${PR_NUMBER}/assignees`).reply(201, {});

    await probot.receive(pullRequestOpened());

    expect(nock.pendingMocks()).toStrictEqual([]);
    expect(commentBody).toContain("New version can't be less than existing version");
  });

  it('does nothing on an ignored branch', async () => {
    const scope = nock(GITHUB_API);
    scope.get(configPath).query(true).twice().reply(200, configEnvelope());

    // Must NOT be called on an ignored branch.
    const commentMock = nock(GITHUB_API)
      .post(/\/comments$/)
      .reply(201, {});
    const assigneesMock = nock(GITHUB_API)
      .post(/\/assignees$/)
      .reply(201, {});

    await probot.receive(pullRequestOpened('dependabot/npm/foo'));

    expect(commentMock.isDone()).toBe(false);
    expect(assigneesMock.isDone()).toBe(false);
  });
});

describe('pull_request.synchronize', () => {
  it('comments on a version bump (single config fetch)', async () => {
    const scope = nock(GITHUB_API);
    // `synchronize` fetches config once (only inside processPullRequest).
    scope.get(configPath).query(true).once().reply(200, configEnvelope());
    scope.get(manifestPath).query({ ref: HEAD_SHA }).reply(200, manifestEnvelope('1.2.0'));
    scope.get(manifestPath).query({ ref: BASE_SHA }).reply(200, manifestEnvelope('1.1.0'));

    let commentBody = '';
    scope
      .post(
        `/repos/amitsingh-007/webext-bot/issues/${PR_NUMBER}/comments`,
        (body: { body: string }) => {
          commentBody = body.body;
          return true;
        }
      )
      .reply(201, {});

    await probot.receive(pullRequestSynchronize());

    expect(nock.pendingMocks()).toStrictEqual([]);
    expect(commentBody).toContain('Extension version is updated from `1.1.0` to `1.2.0`');
  });
});
