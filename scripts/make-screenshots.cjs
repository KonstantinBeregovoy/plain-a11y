// Generates the Chrome Web Store screenshots (1280x800) into store/screenshots.
//
// The frames are real: the built extension runs in Chromium against the demo
// pages in store/demo, and the popup and the page are photographed as they are.
// Only the frame around them (headline, window, ticket) is drawn.
//
// Not wired to an npm script because it needs Playwright, which is not a
// dependency of the project:
//   npm run build
//   npx playwright install chromium   (once, if no browser is installed)
//   npm install --no-save playwright
//   node scripts/make-screenshots.cjs
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'store', 'screenshots');
const SITE = 'https://sunrise-coffee.example';
const PAGE_SIZE = { width: 800, height: 576 };
// 15px wider than the popup content: a real popup grows by the width of its scrollbar.
const POPUP_SIZE = { width: 375, height: 600 };

const ICON = fs.readFileSync(path.join(ROOT, 'src', 'public', 'icon', '48.png'));
const DEMO = {
  '/': fs.readFileSync(path.join(ROOT, 'store', 'demo', 'index.html'), 'utf8'),
  '/fixed': fs.readFileSync(path.join(ROOT, 'store', 'demo', 'clean.html'), 'utf8'),
};

const dataUri = (buffer, type = 'image/png') =>
  `data:${type};base64,${buffer.toString('base64')}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Copies the build and gives it host access, which an automated run needs instead of a click on the icon. */
function prepareExtension() {
  const source = path.join(ROOT, '.output', 'chrome-mv3');
  if (!fs.existsSync(source)) throw new Error('Run "npm run build" first.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plain-a11y-ext-'));
  fs.cpSync(source, dir, { recursive: true });
  const file = path.join(dir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  manifest.host_permissions = ['<all_urls>'];
  fs.writeFileSync(file, JSON.stringify(manifest));
  return dir;
}

/** A minimal Markdown renderer for the report: headings, paragraphs and checkbox items. */
function renderMarkdown(markdown) {
  const escape = (text) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = [];
  let inList = false;
  const closeList = () => {
    if (inList) html.push('</ul>');
    inList = false;
  };
  for (const line of markdown.split('\n')) {
    if (line.startsWith('- [ ] ')) {
      if (!inList) html.push('<ul>');
      inList = true;
      html.push(`<li><span class="box"></span><span>${escape(line.slice(6))}</span></li>`);
      continue;
    }
    closeList();
    if (line.startsWith('## ')) html.push(`<h3>${escape(line.slice(3))}</h3>`);
    else if (line.startsWith('# ')) html.push(`<h2>${escape(line.slice(2))}</h2>`);
    else if (line.trim()) html.push(`<p>${escape(line)}</p>`);
  }
  closeList();
  return html.join('\n');
}

function ticketHtml(markdown) {
  return `<div class="ticket">
    <div class="ticket-head">
      <div class="ticket-title">Fix accessibility problems on the home page</div>
      <div class="chips"><span>Open</span><span>Design</span><span>Content</span><span>Development</span></div>
    </div>
    <div class="ticket-body">${renderMarkdown(markdown)}</div>
  </div>`;
}

function frameHtml({ caption, subtitle, left, popup, address }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { margin: 0; width: 1280px; height: 800px; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #0b2b5c 0%, #0b57d0 100%);
      font-family: system-ui, "Segoe UI", Roboto, sans-serif; color: #fff; }
    h1 { position: absolute; left: 40px; top: 30px; margin: 0; font-size: 40px; line-height: 1.15; font-weight: 700; }
    .sub { position: absolute; left: 40px; top: 84px; margin: 0; font-size: 21px; color: #dbe7ff; }
    .window { position: absolute; left: 40px; top: 140px; width: 800px; height: 620px; background: #fff;
      border-radius: 12px; overflow: hidden; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
    .toolbar { height: 44px; background: #e9edf3; display: flex; align-items: center; padding: 0 14px; gap: 8px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #c5ccd8; }
    .address { flex: 1; margin: 0 10px 0 14px; height: 28px; border-radius: 14px; background: #fff; color: #4b5563;
      font-size: 14px; display: flex; align-items: center; padding: 0 14px; }
    .ext { width: 24px; height: 24px; }
    .content { width: 800px; height: 576px; position: relative; overflow: hidden; background: #fff; }
    .content > img { display: block; width: 800px; height: 576px; }
    .popup { position: absolute; right: 40px; top: 140px; border-radius: 12px; overflow: hidden;
      box-shadow: 0 18px 50px rgba(0,0,0,.4); background: #fff; }
    .popup img { display: block; }
    .ticket { color: #1f2933; height: 576px; background: #f7f8fa; padding: 22px 26px; overflow: hidden; position: relative; }
    .ticket::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 70px;
      background: linear-gradient(to bottom, rgba(247,248,250,0), #f7f8fa); }
    .ticket-title { font-size: 21px; font-weight: 700; margin-bottom: 10px; }
    .chips span { display: inline-block; font-size: 12px; padding: 3px 10px; border-radius: 999px; background: #e1e7ef; color: #334155; margin-right: 6px; }
    .ticket-body { margin-top: 16px; background: #fff; border: 1px solid #dde3ec; border-radius: 8px; padding: 16px 20px; font-size: 13px; line-height: 1.5; }
    .ticket-body h2 { font-size: 17px; margin: 0 0 8px; }
    .ticket-body h3 { font-size: 14px; margin: 14px 0 6px; }
    .ticket-body p { margin: 4px 0; }
    .ticket-body ul { list-style: none; padding: 0; margin: 0; }
    .ticket-body li { display: flex; gap: 8px; margin: 5px 0; }
    .box { flex: none; width: 13px; height: 13px; border: 2px solid #64748b; border-radius: 3px; margin-top: 3px; }
  </style></head><body>
    <h1>${caption}</h1>
    <p class="sub">${subtitle}</p>
    <div class="window">
      <div class="toolbar"><span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="address">${address}</div><img class="ext" alt="" src="${dataUri(ICON)}"></div>
      <div class="content">${left}</div>
    </div>
    <div class="popup"><img alt="" src="${dataUri(popup)}"></div>
  </body></html>`;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const extension = prepareExtension();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'plain-a11y-profile-'));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`, '--no-sandbox'],
  });
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent('serviceworker');
  const origin = `chrome-extension://${new URL(worker.url()).host}`;

  await context.route(`${SITE}/**`, (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const body = DEMO[pathname];
    return body
      ? route.fulfill({ contentType: 'text/html', body })
      : route.fulfill({ status: 404, body: 'Not found' });
  });

  const composer = await chromium.launch();

  /** Opens the demo page and the popup, runs a check, and returns both pages. */
  async function session({ site = '/', scheme = 'light' } = {}) {
    const page = await context.newPage();
    await page.setViewportSize(PAGE_SIZE);
    await page.goto(`${SITE}${site}`);
    const popup = await context.newPage();
    await popup.setViewportSize(POPUP_SIZE);
    await popup.emulateMedia({ colorScheme: scheme });
    await popup.addInitScript(() => {
      const write = navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async (text) => {
        window.__copied = text;
        return write(text);
      };
    });
    await popup.goto(`${origin}/popup.html`);
    await page.bringToFront();
    return { page, popup };
  }

  async function check({ popup, page }) {
    await page.bringToFront();
    await popup.evaluate(() => document.querySelector('button').click());
    await popup.waitForSelector('[role=status] p');
    await sleep(500);
  }

  const popupShot = (popup) => popup.screenshot();
  /** The popup as it would open: as tall as its content, up to the 600px Chrome allows. */
  async function popupFit(popup) {
    const bottom = await popup.evaluate(() =>
      Math.ceil(document.querySelector('main').getBoundingClientRect().bottom));
    return popup.screenshot({ clip: { x: 0, y: 0, width: 360, height: Math.min(bottom, 600) } });
  }
  async function scrollPopupTo(popup, code) {
    await popup.evaluate((rule) => {
      const item = [...document.querySelectorAll('li')].find((li) => li.querySelector('code')?.textContent === rule);
      item?.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -8);
    }, code);
    await sleep(200);
  }
  const pageLeft = async (page) =>
    `<img alt="" src="${dataUri(await page.screenshot())}">`;

  const frames = [];
  const add = (name, spec) => frames.push({ name, spec });

  // 1. Before the check
  {
    const s = await session();
    add('01-check-any-page', {
      caption: 'Check any page with one click',
      subtitle: 'Plain A11y finds accessibility problems and explains them in plain language.',
      address: 'sunrise-coffee.example', left: await pageLeft(s.page), popup: await popupFit(s.popup),
    });
    await s.page.close(); await s.popup.close();
  }
  // 2. Results grouped by severity and role
  {
    const s = await session(); await check(s);
    add('02-grouped-by-severity-and-role', {
      caption: 'Problems grouped by severity and by role',
      subtitle: 'Critical, Serious and Minor, split into Design, Content and Code.',
      address: 'sunrise-coffee.example', left: await pageLeft(s.page), popup: await popupShot(s.popup),
    });
    // 3. A single problem, close up
    await scrollPopupTo(s.popup, 'image-alt');
    add('03-plain-language-explanation', {
      caption: 'What is wrong, who it affects, how to fix it',
      subtitle: 'No WCAG jargon: every problem comes with a plain explanation.',
      address: 'sunrise-coffee.example', left: await pageLeft(s.page), popup: await popupShot(s.popup),
    });
    // 4. Highlight on the page
    await s.popup.getByRole('button', { name: /^Show on page: Image has no text description/ })
      .evaluate((button) => button.click());
    await sleep(1600);
    add('04-show-problem-on-page', {
      caption: 'See the problem right on the page',
      subtitle: '“Show on page” outlines the element and scrolls to it.',
      address: 'sunrise-coffee.example', left: await pageLeft(s.page), popup: await popupShot(s.popup),
    });
    await s.popup.getByRole('button', { name: /^Show on page: Image has no text description/ })
      .evaluate((button) => button.click());
    await sleep(500);
    await s.page.close(); await s.popup.close();
  }
  {
    // A fresh session, so that no message from the highlight step is left in the popup.
    const s = await session(); await check(s);
    // 5. Role filter
    await s.popup.getByRole('radio', { name: 'Design' }).check();
    await sleep(300);
    add('05-filter-by-role', {
      caption: 'Send each task to the right person',
      subtitle: 'Filter by role to see only the designer’s, editor’s or developer’s tasks.',
      address: 'sunrise-coffee.example', left: await pageLeft(s.page), popup: await popupShot(s.popup),
    });
    await s.popup.getByRole('radio', { name: 'All' }).check();
    await sleep(300);
    // 6. Copy the report
    await s.popup.evaluate(() => window.scrollTo(0, 0));
    await s.popup.getByRole('button', { name: 'Copy report' }).click();
    await sleep(500);
    const report = await s.popup.evaluate(() => window.__copied);
    add('06-copy-report-for-a-ticket', {
      caption: 'Copy a report that is ready for a ticket',
      subtitle: 'One click gives a Markdown checklist grouped by role.',
      address: 'tracker.example/tickets/214', left: ticketHtml(report), popup: await popupShot(s.popup),
    });
    await s.page.close(); await s.popup.close();
  }
  // 7. A clean page: honest about the limits
  {
    const s = await session({ site: '/fixed' }); await check(s);
    await s.popup.getByRole('button', { name: 'Copy report' }).click();
    await sleep(500);
    const report = await s.popup.evaluate(() => window.__copied);
    add('07-honest-about-limits', {
      caption: 'Honest about its limits',
      subtitle: 'Even an empty result reminds you that automation covers only part of the requirements.',
      address: 'tracker.example/tickets/215', left: ticketHtml(report), popup: await popupFit(s.popup),
    });
    await s.page.close(); await s.popup.close();
  }
  // 8. Dark theme
  {
    const s = await session({ scheme: 'dark' }); await check(s);
    add('08-dark-theme', {
      caption: 'A dark theme that stays accessible',
      subtitle: 'Checked against WCAG 2.2 AA in the light and the dark scheme.',
      address: 'sunrise-coffee.example', left: await pageLeft(s.page), popup: await popupShot(s.popup),
    });
    await s.page.close(); await s.popup.close();
  }

  const frame = await composer.newPage({ viewport: { width: 1280, height: 800 } });
  for (const { name, spec } of frames) {
    await frame.setContent(frameHtml(spec));
    const png = await frame.screenshot();
    // The store wants 24-bit PNG without an alpha channel.
    await sharp(png).flatten({ background: '#ffffff' }).removeAlpha()
      .png({ compressionLevel: 9 }).toFile(path.join(OUT, `${name}.png`));
    console.log(`store/screenshots/${name}.png`);
  }

  await composer.close();
  await context.close();
  fs.rmSync(extension, { recursive: true, force: true });
  fs.rmSync(profile, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
