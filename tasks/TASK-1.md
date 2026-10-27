# TASK-1: Основа

Цель: проект собирается, расширение по кнопке запускает axe-core на текущей вкладке и показывает список нарушений.

## Сделать
1. Создать проект WXT + React + TypeScript (strict). Настроить Vitest и npm-скрипты typecheck, test, build.
2. Manifest V3 с permissions activeTab, scripting, storage.
3. Popup с кнопкой «Проверить страницу».
4. По клику service worker внедряет content script через chrome.scripting.executeScript. Content script запускает axe-core на странице и возвращает violations.
5. Popup показывает для каждого нарушения: id правила, impact, число затронутых элементов.
6. Закрепить версию axe-core точным номером в package.json.
7. Создать tests/fixtures/basic.html с заведомыми проблемами: img без alt, input без подписи, текст с низким контрастом, ссылка без текста.

## Критерии приёмки
- npm run typecheck, npm run test, npm run build проходят без ошибок.
- Собранное расширение загружается в chrome://extensions без ошибок.
- Проверка basic.html показывает минимум правила image-alt, label, color-contrast, link-name.
- Есть unit-тест функции, которая превращает результат axe в список для popup.

## Не делать
Словарь, группировку, подсветку, экспорт.
