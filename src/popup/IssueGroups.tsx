import {
  ROLE_LABELS,
  SEVERITY_LABELS,
  type RoleGroup,
  type SeverityGroup,
} from '../report/groupReport';
import type { ViolationItem } from '../report/violations';

type ToggleHighlight = (item: ViolationItem, key: string) => void;

interface RoleGroupListProps {
  roles: RoleGroup[];
  highlightedId: string | null;
  /** Added to the rule id to make the highlight key unique per section. */
  keyPrefix: string;
  onToggleHighlight: ToggleHighlight;
}

/** Role headings, each with its issues and “Show on page” buttons. */
export function RoleGroupList({
  roles,
  highlightedId,
  keyPrefix,
  onToggleHighlight,
}: RoleGroupListProps) {
  return (
    <>
      {roles.map((roleGroup) => (
        <div key={roleGroup.role}>
          <h3>
            {ROLE_LABELS[roleGroup.role]}: {roleGroup.issues.length}
          </h3>
          <ul className="violations">
            {roleGroup.issues.map(({ item, rule }) => {
              const key = `${keyPrefix}${item.id}`;
              return (
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
                    Elements: {item.nodeCount}. Rule: <code>{item.id}</code>
                  </p>
                  <button
                    type="button"
                    className="secondary"
                    aria-pressed={highlightedId === key}
                    aria-label={`Show on page: ${rule.title}`}
                    disabled={item.targets.length === 0}
                    onClick={() => onToggleHighlight(item, key)}
                  >
                    Show on page
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

interface IssueGroupsProps {
  groups: SeverityGroup[];
  highlightedId: string | null;
  onToggleHighlight: ToggleHighlight;
}

/** Issues grouped by severity, then by role. */
export function IssueGroups({
  groups,
  highlightedId,
  onToggleHighlight,
}: IssueGroupsProps) {
  return (
    <>
      {groups.map((group) => (
        <section
          key={group.severity}
          className="severity"
          aria-labelledby={`severity-${group.severity}`}
        >
          <h2 id={`severity-${group.severity}`}>
            {SEVERITY_LABELS[group.severity]}: {group.count}
          </h2>
          <RoleGroupList
            roles={group.roles}
            highlightedId={highlightedId}
            keyPrefix=""
            onToggleHighlight={onToggleHighlight}
          />
        </section>
      ))}
    </>
  );
}
