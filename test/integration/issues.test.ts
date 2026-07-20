import nock from 'nock';
import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import {
  newProbot,
  GITHUB_API,
  contentsPath,
  configEnvelope,
} from '../helpers';
import { issuesOpened, ISSUE_NUMBER } from '../fixtures/payloads';

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

describe('issues.opened', () => {
  it('adds the configured assignees', async () => {
    const scope = nock(GITHUB_API);
    scope.get(configPath).query(true).reply(200, configEnvelope());

    let assignees: string[] = [];
    scope
      .post(
        `/repos/amitsingh-007/webext-bot/issues/${ISSUE_NUMBER}/assignees`,
        (body: { assignees: string[] }) => {
          assignees = body.assignees;
          return true;
        }
      )
      .reply(201, {});

    await probot.receive(issuesOpened());

    expect(nock.pendingMocks()).toStrictEqual([]);
    expect(assignees).toEqual(['reviewer1']);
  });

  it('does not add assignees when auto-assign is empty', async () => {
    const scope = nock(GITHUB_API);
    scope
      .get(configPath)
      .query(true)
      .reply(200, configEnvelope({ 'auto-assign': [] }));

    const assigneesMock = nock(GITHUB_API)
      .post(/\/assignees$/)
      .reply(201, {});

    await probot.receive(issuesOpened());

    expect(assigneesMock.isDone()).toBe(false);
  });
});
