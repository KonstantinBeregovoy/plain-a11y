import { useEffect, useMemo, useState } from 'react';
import {
  POPUP_PORT,
  type CheckResponse,
  type ClearHighlightRequest,
  type HighlightRequest,
  type HighlightResponse,
  type RunCheckRequest,
} from '../report/messages';
import {
  ROLE_LABELS,
  ROLE_ORDER,
  SEVERITY_LABELS,
  groupReport,
} from '../report/groupReport';
import { toMarkdown } from '../report/toMarkdown';
import type { ViolationItem } from '../report/violations';
import { loadRoleFilter, saveRoleFilter, type RoleFilter } from './settings';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; items: ViolationItem[]; url: string; checkedAt: Date }
  | { status: 'error'; message: string };

const FILTER_OPTIONS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...ROLE_ORDER.map((role) => ({ value: role, label: ROLE_LABELS[role] })),
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function App() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  // The open port tells the service worker when the popup closes, so it can remove the highlight.
  useEffect(() => {
    const port = browser.runtime.connect({ name: POPUP_PORT });
    return () => port.disconnect();
  }, []);

  // Restore the selected role filter.
  useEffect(() => {
    let cancelled = false;
    loadRoleFilter()
      .then((saved) => {
        if (!cancelled) setRoleFilter(saved);
      })
      .catch(() => {
        // Without saved settings the filter stays on “All”.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(
    () =>
      state.status === 'done'
        ? groupReport(state.items, roleFilter === 'all' ? undefined : roleFilter)
        : [],
    [state, roleFilter],
  );

  async function clearHighlight() {
    const request: ClearHighlightRequest = { type: 'clear-highlight' };
    await browser.runtime.sendMessage(request);
    setHighlightedId(null);
  }

  async function runCheck() {
    // aria-disabled instead of disabled keeps keyboard focus on the button.
    if (state.status === 'loading') return;
    setState({ status: 'loading' });
    setNotice('');
    try {
      await clearHighlight();
      const request: RunCheckRequest = { type: 'run-check' };
      const response = (await browser.runtime.sendMessage(
        request,
      )) as CheckResponse;
      setState(
        response.ok
          ? {
              status: 'done',
              items: response.items,
              url: response.url,
              checkedAt: new Date(),
            }
          : { status: 'error', message: response.error },
      );
    } catch (error) {
      setState({ status: 'error', message: errorMessage(error) });
    }
  }

  function changeRoleFilter(value: RoleFilter) {
    setRoleFilter(value);
    saveRoleFilter(value).catch(() => {
      // Saving failed: the filter simply will not be remembered.
    });
  }

  async function copyReport() {
    if (state.status !== 'done') return;
    const markdown = toMarkdown(state.items, {
      url: state.url,
      date: state.checkedAt,
    });
    // Clear the message first so that copying again is announced again.
    setNotice('');
    try {
      await navigator.clipboard.writeText(markdown);
      setNotice('Report copied to the clipboard.');
    } catch {
      setNotice('Could not copy the report.');
    }
  }

  async function toggleHighlight(item: ViolationItem) {
    try {
      if (highlightedId === item.id) {
        await clearHighlight();
        setNotice('Highlight removed.');
        return;
      }
      const request: HighlightRequest = {
        type: 'highlight',
        targets: item.targets,
      };
      const response = (await browser.runtime.sendMessage(
        request,
      )) as HighlightResponse;
      if (!response.ok) {
        setHighlightedId(null);
        setNotice(`Could not highlight: ${response.error}`);
      } else if (response.found === 0) {
        setHighlightedId(null);
        setNotice('Element not found on the page.');
      } else {
        setHighlightedId(item.id);
        setNotice(`Highlighted elements: ${response.found}.`);
      }
    } catch (error) {
      setHighlightedId(null);
      setNotice(`Could not highlight: ${errorMessage(error)}`);
    }
  }

  return (
    <main>
      <h1>Plain A11y</h1>
      <button
        type="button"
        onClick={runCheck}
        aria-disabled={state.status === 'loading'}
      >
        Check page
      </button>
      <div role="status" aria-live="polite">
        {state.status === 'loading' && <p>Checking…</p>}
        {state.status === 'done' && (
          <p>
            {state.items.length === 0
              ? 'No issues found.'
              : `Issues found: ${state.items.length}`}
          </p>
        )}
        {notice && <p>{notice}</p>}
      </div>
      {state.status === 'error' && (
        <p role="alert">Could not check the page: {state.message}</p>
      )}
      {state.status === 'done' && (
        <button type="button" className="secondary" onClick={copyReport}>
          Copy report
        </button>
      )}
      {state.status === 'done' && state.items.length > 0 && (
        <>
          <fieldset className="filter">
            <legend>Show tasks for role</legend>
            {FILTER_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="role-filter"
                  value={option.value}
                  checked={roleFilter === option.value}
                  onChange={() => changeRoleFilter(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          {groups.length === 0 && <p>No issues found for this role.</p>}
          {groups.map((group) => (
            <section
              key={group.severity}
              className="severity"
              aria-labelledby={`severity-${group.severity}`}
            >
              <h2 id={`severity-${group.severity}`}>
                {SEVERITY_LABELS[group.severity]}: {group.count}
              </h2>
              {group.roles.map((roleGroup) => (
                <div key={roleGroup.role}>
                  <h3>
                    {ROLE_LABELS[roleGroup.role]}: {roleGroup.issues.length}
                  </h3>
                  <ul className="violations">
                    {roleGroup.issues.map(({ item, rule }) => (
                      <li key={item.id}>
                        <h4>{rule.title}</h4>
                        {rule.whoIsAffected && (
                          <p>
                            <strong>Who is affected:</strong> {rule.whoIsAffected}
                          </p>
                        )}
                        {rule.howToFix && (
                          <p>
                            <strong>How to fix:</strong> {rule.howToFix}
                          </p>
                        )}
                        <p className="meta">
                          Elements: {item.nodeCount}. Rule:{' '}
                          <code>{item.id}</code>
                        </p>
                        <button
                          type="button"
                          className="secondary"
                          aria-pressed={highlightedId === item.id}
                          aria-label={`Show on page: ${rule.title}`}
                          disabled={item.targets.length === 0}
                          onClick={() => toggleHighlight(item)}
                        >
                          Show on page
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </>
      )}
    </main>
  );
}
