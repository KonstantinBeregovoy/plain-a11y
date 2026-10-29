# TASK-4: Export and settings

Goal: the report is copied as Markdown for a ticket, and the chosen filter is remembered.

## Steps
1. In src/report add the function toMarkdown. Format: a heading with the page address and the date, then sections by role, each with checkbox items of the form “- [ ] severity: description. How to fix: ...”.
2. A “Copy report” button. After copying, a message for the screen reader through aria-live.
3. The chosen role filter is saved in chrome.storage.local and restored when the popup opens.

## Acceptance criteria
- All checks from earlier stages pass.
- Snapshot test of toMarkdown on a fixed input.
- Test: the settings are saved and read.
- For an empty result the report says that the automated check found no problems, and reminds that it covers only part of the requirements.

## Do not
Interface translation, own rules.
