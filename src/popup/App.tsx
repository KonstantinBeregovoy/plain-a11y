import { useState } from 'react';
import type { CheckResponse, RunCheckRequest } from '../report/messages';
import type { ViolationItem } from '../report/violations';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; items: ViolationItem[] }
  | { status: 'error'; message: string };

export function App() {
  const [state, setState] = useState<State>({ status: 'idle' });

  async function runCheck() {
    setState({ status: 'loading' });
    try {
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
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      });
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
      </div>
      {state.status === 'error' && (
        <p role="alert">Не удалось проверить страницу: {state.message}</p>
      )}
      {state.status === 'done' && state.items.length > 0 && (
        <ul className="violations">
          {state.items.map((item) => (
            <li key={item.id}>
              <strong>{item.id}</strong>
              <span>Важность: {item.impact}</span>
              <span>Элементов: {item.nodeCount}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
