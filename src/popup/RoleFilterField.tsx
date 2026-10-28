import { ROLE_LABELS, ROLE_ORDER } from '../report/groupReport';
import type { RoleFilter } from './settings';

const OPTIONS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...ROLE_ORDER.map((role) => ({ value: role, label: ROLE_LABELS[role] })),
];

interface Props {
  value: RoleFilter;
  onChange: (value: RoleFilter) => void;
}

export function RoleFilterField({ value, onChange }: Props) {
  return (
    <fieldset className="filter">
      <legend>Show tasks for role</legend>
      {OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="role-filter"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
