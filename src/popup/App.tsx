import { useMemo, useState } from 'react';
import { groupByRole, groupReport } from '../report/groupReport';
import { toMarkdown } from '../report/toMarkdown';
import { IssueGroups } from './IssueGroups';
import { ReviewSection } from './ReviewSection';
import { RoleFilterField } from './RoleFilterField';
import { useCheck } from './useCheck';
import { useHighlight } from './useHighlight';
import { useRoleFilter } from './useRoleFilter';

export function App() {
  const [notice, setNotice] = useState('');
  const highlight = useHighlight(setNotice);
  const { state, runCheck } = useCheck(async () => {
    setNotice('');
    await highlight.clear();
  });
  const { roleFilter, changeRoleFilter } = useRoleFilter();

  const role = roleFilter === 'all' ? undefined : roleFilter;
  const groups = useMemo(
    () => (state.status === 'done' ? groupReport(state.items, role) : []),
    [state, role],
  );
  const reviewRoles = useMemo(
    () => (state.status === 'done' ? groupByRole(state.review, role) : []),
    [state, role],
  );

  async function copyReport() {
    if (state.status !== 'done') return;
    const markdown = toMarkdown(
      state.items,
      { url: state.url, date: state.checkedAt },
      state.review,
    );
    // Clear the message first so that copying again is announced again.
    setNotice('');
    try {
      await navigator.clipboard.writeText(markdown);
      setNotice('Report copied to the clipboard.');
    } catch {
      setNotice('Could not copy the report.');
    }
  }

  return (
    <main>
      <h1>Plain A11y</h1>
      {/* aria-disabled instead of disabled keeps keyboard focus on the button. */}
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
            {state.review.length > 0 &&
              ` Needs manual review: ${state.review.length}.`}
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
      {state.status === 'done' && state.items.length + state.review.length > 0 && (
        <>
          <RoleFilterField value={roleFilter} onChange={changeRoleFilter} />
          {groups.length + reviewRoles.length === 0 && (
            <p>No issues found for this role.</p>
          )}
          <IssueGroups
            groups={groups}
            highlightedId={highlight.highlightedId}
            onToggleHighlight={highlight.toggle}
          />
          <ReviewSection
            roles={reviewRoles}
            highlightedId={highlight.highlightedId}
            onToggleHighlight={highlight.toggle}
          />
        </>
      )}
    </main>
  );
}
