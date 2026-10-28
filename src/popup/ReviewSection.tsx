import type { RoleGroup } from '../report/groupReport';
import type { ViolationItem } from '../report/violations';
import { RoleGroupList } from './IssueGroups';

interface Props {
  roles: RoleGroup[];
  highlightedId: string | null;
  onToggleHighlight: (item: ViolationItem, key: string) => void;
}

/** Cases the automated check could not decide on its own. Not counted as issues. */
export function ReviewSection({ roles, highlightedId, onToggleHighlight }: Props) {
  const count = roles.reduce((sum, role) => sum + role.issues.length, 0);
  if (count === 0) return null;
  return (
    <section className="severity" aria-labelledby="review-heading">
      <h2 id="review-heading">Needs manual review: {count}</h2>
      <p>
        The automated check could not decide these on its own. A person needs to
        look at them.
      </p>
      <RoleGroupList
        roles={roles}
        highlightedId={highlightedId}
        keyPrefix="review:"
        onToggleHighlight={onToggleHighlight}
      />
    </section>
  );
}
