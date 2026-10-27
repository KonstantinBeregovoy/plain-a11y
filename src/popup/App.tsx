import { useEffect, useMemo, useState } from 'react';
import type { Role } from '../dictionary/dictionary';
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
import type { ViolationItem } from '../report/violations';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; items: ViolationItem[] }
  | { status: 'error'; message: string };

type RoleFilter = Role | 'all';

const FILTER_OPTIONS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
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

  // Открытый порт сообщает service worker, когда popup закрыт: тогда он снимает подсветку.
  useEffect(() => {
    const port = browser.runtime.connect({ name: POPUP_PORT });
    return () => port.disconnect();
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
          ? { status: 'done', items: response.items }
          : { status: 'error', message: response.error },
      );
    } catch (error) {
      setState({ status: 'error', message: errorMessage(error) });
    }
  }

  async function toggleHighlight(item: ViolationItem) {
    try {
      if (highlightedId === item.id) {
        await clearHighlight();
        setNotice('Подсветка снята.');
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
        setNotice(`Не удалось подсветить: ${response.error}`);
      } else if (response.found === 0) {
        setHighlightedId(null);
        setNotice('Элемент не найден на странице.');
      } else {
        setHighlightedId(item.id);
        setNotice(`Подсвечено элементов: ${response.found}.`);
      }
    } catch (error) {
      setHighlightedId(null);
      setNotice(`Не удалось подсветить: ${errorMessage(error)}`);
    }
  }

  return (
    <main>
      <h1>Plain A11y</h1>
      <button type="button" onClick={runCheck} disabled={state.status === 'loading'}>
        Проверить страницу
      </button>
      <div role="status" aria-live="polite">
        {state.status === 'loading' && <p>Проверяем…</p>}
        {state.status === 'done' && (
          <p>
            {state.items.length === 0
              ? 'Нарушений не найдено.'
              : `Найдено нарушений: ${state.items.length}`}
          </p>
        )}
        {notice && <p>{notice}</p>}
      </div>
      {state.status === 'error' && (
        <p role="alert">Не удалось проверить страницу: {state.message}</p>
      )}
      {state.status === 'done' && state.items.length > 0 && (
        <>
          <fieldset className="filter">
            <legend>Показать задачи для роли</legend>
            {FILTER_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="role-filter"
                  value={option.value}
                  checked={roleFilter === option.value}
                  onChange={() => setRoleFilter(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          {groups.length === 0 && <p>Для этой роли проблем не найдено.</p>}
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
                            <strong>Кого касается:</strong> {rule.whoIsAffected}
                          </p>
                        )}
                        {rule.howToFix && (
                          <p>
                            <strong>Как исправить:</strong> {rule.howToFix}
                          </p>
                        )}
                        <p className="meta">
                          Элементов: {item.nodeCount}. Правило:{' '}
                          <code>{item.id}</code>
                        </p>
                        <button
                          type="button"
                          className="secondary"
                          aria-pressed={highlightedId === item.id}
                          aria-label={`Показать на странице: ${rule.title}`}
                          disabled={item.targets.length === 0}
                          onClick={() => toggleHighlight(item)}
                        >
                          Показать на странице
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
