# TASK-18: Process files in English

Goal: the process files (`SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `tasks/`) are in English, so the repository can be made public as a single-language project.

## Steps
1. Translate `SPEC.md` and `AGENTS.md` into English. Keep the numbering, the structure and the meaning of every rule.
2. Make `CLAUDE.md` a one-line pointer to `AGENTS.md` (the rules live in one place; `AGENTS.md` is read by several agents, `CLAUDE.md` by Claude Code).
3. Translate `tasks/TASK-1.md` to `tasks/TASK-17.md`. Keep the headings, the order of sections and the facts: numbers, file names and results stay as they were. Interface strings are written as the interface shows them (“Check page”, “Show on page”, “Copy report”).
4. Update the places that say the task files are in Russian (`docs/PROJECT_LOG.md`) and mention the process files in `README.md`.
5. Do not touch the git history. The earlier Russian versions stay in it.

## Acceptance criteria
- No Cyrillic letters in any tracked file of the repository (`LC_ALL=en_US.UTF-8 git grep -InP "[А-Яа-яЁё]"` finds nothing; the option `-I` skips binary files such as PNG).
- The section headings of every task file are the same as before, in English: Goal, Steps, Acceptance criteria, Do not, and the results sections.
- `npm run typecheck`, `npm run test`, `npm run build` and `npm run zip` pass; the number of tests does not change (131).
- The package contains none of the process files (a check of the zip content).

## Do not
Change code, tests, the stack or the pinned versions. Rewrite the history. Change the meaning of a result (even an unflattering one). Add new rules to `AGENTS.md`.

## Results

1. Translated: `SPEC.md`, `AGENTS.md` and the 17 files `tasks/TASK-1.md` to `tasks/TASK-17.md`. Headings, order of sections, numbers and file names are kept. `CLAUDE.md` is now a pointer to `AGENTS.md` (a link and the import line `@AGENTS.md`).
2. Check for Cyrillic: before, 19 files had Russian lines (`SPEC.md` 32 lines, the task files 10 to 27 each). After, `LC_ALL=en_US.UTF-8 git grep -InP "[А-Яа-яЁё]"` finds nothing in text files. The same command finds 32 lines in the old `SPEC.md`, so the check itself works. The first form of the command in the criteria did not work (`\x{...}` is not accepted by git grep); it is corrected above.
3. One sentence was repaired while translating. In the old `TASK-17.md` result 2 the number of tests was written in a garbled way (“131 before the wording and after”). The new text says “131, all pass (there were 122: 6 new highlight tests, 3 new popup message tests)”, which is what the numbers mean (122 + 9 = 131). No other result was changed in meaning.
4. `README.md` (the folder table) and `docs/PROJECT_LOG.md` (the list of what is left, decision 7, the number of task files) are updated.
5. Checks: `npm run typecheck` passes, `npm run test` 131 of 131, `npm run build` 952.52 kB, `npm run zip` 279.89 kB. The zip contains no process files; the only `.md` in it is `THIRD_PARTY_NOTICES.md`.
6. Not checked: the quality of the English by a native reader. The owner should read `SPEC.md`, `AGENTS.md` and one or two task files before the repository becomes public.
