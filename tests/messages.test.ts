import { describe, expect, it } from 'vitest';
import {
  errorMessage,
  hasType,
  isHighlightRequest,
} from '../src/report/messages';

describe('errorMessage', () => {
  it('takes the message of an Error and stringifies anything else', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
    expect(errorMessage('plain text')).toBe('plain text');
    expect(errorMessage(42)).toBe('42');
  });
});

describe('message guards', () => {
  it('recognises messages by type', () => {
    expect(hasType({ type: 'ping' }, 'ping')).toBe(true);
    expect(hasType({ type: 'run-axe' }, 'ping')).toBe(false);
    expect(hasType(null, 'ping')).toBe(false);
    expect(hasType('ping', 'ping')).toBe(false);
  });

  it('accepts only well-formed highlight requests', () => {
    expect(isHighlightRequest({ type: 'highlight', targets: ['img', '#a'] })).toBe(true);
    expect(isHighlightRequest({ type: 'highlight', targets: [1] })).toBe(false);
    expect(isHighlightRequest({ type: 'highlight' })).toBe(false);
    expect(isHighlightRequest({ type: 'clear-highlight' })).toBe(false);
  });
});
