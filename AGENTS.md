# Rules for the agent

1. Before you start, read SPEC.md and the task file you were pointed to. Do only that stage.
2. Do not add features, dependencies or files beyond the task. If something is missing, write the question at the end of the task file and pick the simplest reasonable solution.
3. Do not invent Chrome or axe-core APIs. If you are not sure a method exists, find it in the documentation or in node_modules.
4. Write tests together with the code. A stage is not finished until all acceptance criteria are met and `npm run typecheck`, `npm run test` and `npm run build` pass without errors.
5. TypeScript is strict: no `any`, no `@ts-ignore`.
6. Small commits with clear messages. One stage, one set of commits.
7. The interface must be accessible: semantic tags, labels on all fields, keyboard control, visible focus.
8. At the end of the answer, list briefly: what was done, which commands were run and their result, what is still unresolved.
9. Do not change the stack, the folder structure or the pinned versions without an explicit request.
