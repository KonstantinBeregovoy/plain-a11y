import {
  ROLE_LABELS,
  SEVERITY_LABELS,
  type SeverityGroup,
} from '../report/groupReport';
import type { ViolationItem } from '../report/violations';

interface Props {
  groups: SeverityGroup[];
  highlightedId: string | null;
  onToggleHighlight: (item: ViolationItem) => void;
}

/** Issues grouped by severity, then by role, each with a “Show on page” button. */
export function IssueGroups({ groups, highlightedId, onToggleHighlight }: Props) {
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
                      Elements: {item.nodeCount}. Rule: <code>{item.id}</code>
                    </p>
                    <button
                      type="button"
                      className="secondary"
                      aria-pressed={highlightedId === item.id}
                      aria-label={`Show on page: ${rule.title}`}
                      disabled={item.targets.length === 0}
                      onClick={() => onToggleHighlight(item)}
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
  );
}
