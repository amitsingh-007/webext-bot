import { describe, it, expect } from 'vitest';
import { getEmoji, getExtSizeChangeComment } from '../../src/utils/message';

describe('getEmoji', () => {
  it('returns the increase emoji for a positive diff', () => {
    expect(getEmoji(1)).toBe('🔺');
  });

  it('returns the decrease emoji for a negative diff', () => {
    expect(getEmoji(-1)).toBe('✅');
  });

  it('returns the zero emoji for no change', () => {
    expect(getEmoji(0)).toBe('0️⃣');
  });
});

describe('getExtSizeChangeComment', () => {
  it('renders a size-increase comment', async () => {
    const comment = await getExtSizeChangeComment(120_000, 100_000, 'abc123');
    expect(comment).toMatchSnapshot();
  });

  it('renders a size-decrease comment', async () => {
    const comment = await getExtSizeChangeComment(90_000, 100_000, 'abc123');
    expect(comment).toMatchSnapshot();
  });

  it('flags a significant increase (> 10KB)', async () => {
    const comment = await getExtSizeChangeComment(130_000, 100_000, 'abc123');
    expect(comment).toContain('Significant size increase in this commit ⚠️');
  });

  it('is upbeat for a small change (<= 10KB)', async () => {
    const comment = await getExtSizeChangeComment(101_000, 100_000, 'abc123');
    expect(comment).toContain('This commit looks good, cheers 👏');
  });
});
