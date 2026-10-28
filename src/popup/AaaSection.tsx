import type { RoleGroup } from '../report/groupReport';
import type { ViolationItem } from '../report/violations';
import { RoleGroupList } from './IssueGroups';

interface Props {
  roles: RoleGroup[];
  shown: boolean;
  onChangeShown: (shown: boolean) => void;
  highlightedId: string | null;
  onToggleHighlight: (item: ViolationItem, key: string) => void;
}

/**
 * Optional recommendations beyond the AA level. Not counted as issues.
 * The toggle is one button that stays in place, so keyboard focus is not lost
 * when the block is hidden or shown again.
 */
export function AaaSection({
  roles,
  shown,
  onChangeShown,
  highlightedId,
  onToggleHighlight,
}: Props) {
  const count = roles.reduce((sum, role) => sum + role.issues.length, 0);
  if (count === 0) return null;
  return (
    <section className="severity" aria-labelledby="aaa-heading">
      <h2 id="aaa-heading">AAA recommendations: {count}</h2>
      <p>
        {shown
          ? 'Optional recommendations beyond the standard level. They are not counted as issues.'
          : 'Hidden. These are optional recommendations beyond the standard level.'}
      </p>
      <button
        type="button"
        className="secondary"
        onClick={() => onChangeShown(!shown)}
      >
        {shown ? 'Hide AAA recommendations' : `Show AAA recommendations (${count})`}
      </button>
      {shown && (
        <RoleGroupList
          roles={roles}
          highlightedId={highlightedId}
          keyPrefix="aaa:"
          onToggleHighlight={onToggleHighlight}
        />
      )}
    </section>
  );
}
